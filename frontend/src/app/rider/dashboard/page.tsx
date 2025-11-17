'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { rideAPI } from '@/lib/api'
import { useSocket, socketOn, socketOff, socketEmit } from '@/lib/socket'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

interface Location {
  latitude: number
  longitude: number
  address: string
}

export default function RiderDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { socket, isConnected } = useSocket()

  const [step, setStep] = useState<'select-pickup' | 'select-dropoff' | 'confirm' | 'finding' | 'active'>('select-pickup')
  const [pickup, setPickup] = useState<Location | null>(null)
  const [dropoff, setDropoff] = useState<Location | null>(null)
  const [fareEstimate, setFareEstimate] = useState<any>(null)
  const [currentRide, setCurrentRide] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<Location | null>(null)
  const [vehicleType, setVehicleType] = useState('ECONOMY')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'RIDER') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (!socket) return

    // Listen for ride acceptance
    socketOn('ride:accepted', (data: any) => {
      setCurrentRide((prev: any) => ({ ...prev, ...data }))
      setStep('active')
      toast.success('Driver accepted your ride!')
    })

    // Listen for driver location updates
    socketOn('driver:location', (data: any) => {
      setDriverLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        address: '',
      })
    })

    // Listen for ride status updates
    socketOn('ride:status', (data: any) => {
      toast.info(`Ride status: ${data.status}`)
      if (data.status === 'COMPLETED') {
        setStep('select-pickup')
        setCurrentRide(null)
        router.push(`/rider/rate/${data.rideId}`)
      }
    })

    // Listen for ride cancellation
    socketOn('ride:cancelled', (data: any) => {
      toast.error('Ride was cancelled')
      setStep('select-pickup')
      setCurrentRide(null)
    })

    return () => {
      socketOff('ride:accepted')
      socketOff('driver:location')
      socketOff('ride:status')
      socketOff('ride:cancelled')
    }
  }, [socket, router])

  const handleLocationSelect = (location: Location) => {
    if (step === 'select-pickup') {
      setPickup(location)
      setStep('select-dropoff')
      toast.success('Pickup location selected')
    } else if (step === 'select-dropoff') {
      setDropoff(location)
      setStep('confirm')
      fetchFareEstimate(pickup!, location)
    }
  }

  const fetchFareEstimate = async (pickupLoc: Location, dropoffLoc: Location) => {
    try {
      const response = await rideAPI.requestRide({
        pickupLatitude: pickupLoc.latitude,
        pickupLongitude: pickupLoc.longitude,
        pickupAddress: pickupLoc.address,
        dropoffLatitude: dropoffLoc.latitude,
        dropoffLongitude: dropoffLoc.longitude,
        dropoffAddress: dropoffLoc.address,
        vehicleType,
      })
      setFareEstimate(response.data.fareDetails)
      setCurrentRide(response.data.ride)
    } catch (error: any) {
      toast.error('Failed to get fare estimate')
    }
  }

  const confirmRide = async () => {
    if (!currentRide) return

    setStep('finding')
    socketEmit('ride:request', { rideId: currentRide.id })
    toast.info('Finding nearby drivers...')
  }

  const cancelRide = async () => {
    if (!currentRide) return

    try {
      await rideAPI.cancelRide(currentRide.id, 'User cancelled')
      socketEmit('ride:cancel', { rideId: currentRide.id, reason: 'User cancelled' })
      setStep('select-pickup')
      setCurrentRide(null)
      setPickup(null)
      setDropoff(null)
      toast.success('Ride cancelled')
    } catch (error) {
      toast.error('Failed to cancel ride')
    }
  }

  const markers = []
  if (pickup) markers.push({ id: '1', ...pickup, type: 'pickup' as const, label: 'Pickup' })
  if (dropoff) markers.push({ id: '2', ...dropoff, type: 'dropoff' as const, label: 'Dropoff' })
  if (driverLocation) markers.push({ id: '3', ...driverLocation, type: 'driver' as const, label: 'Driver' })

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">RideShare</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session?.user?.name}</span>
            <button
              onClick={() => router.push('/rider/history')}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-semibold"
            >
              History
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <Map
          onLocationSelect={step === 'select-pickup' || step === 'select-dropoff' ? handleLocationSelect : undefined}
          markers={markers}
          showRoute={!!pickup && !!dropoff}
          routeCoordinates={
            pickup && dropoff
              ? [[pickup.longitude, pickup.latitude], [dropoff.longitude, dropoff.latitude]]
              : []
          }
        />

        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-96 overflow-y-auto">
          {step === 'select-pickup' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Where to?</h2>
              <p className="text-gray-600">Tap on the map to select pickup location</p>
            </div>
          )}

          {step === 'select-dropoff' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Select destination</h2>
              <p className="text-gray-600 mb-4">Pickup: {pickup?.address}</p>
              <p className="text-gray-600">Tap on the map to select dropoff location</p>
            </div>
          )}

          {step === 'confirm' && fareEstimate && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Confirm your ride</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="ECONOMY">Economy - ${fareEstimate.totalFare}</option>
                  <option value="COMFORT">Comfort - ${(fareEstimate.totalFare * 1.3).toFixed(2)}</option>
                  <option value="PREMIUM">Premium - ${(fareEstimate.totalFare * 1.8).toFixed(2)}</option>
                  <option value="XL">XL - ${(fareEstimate.totalFare * 1.5).toFixed(2)}</option>
                </select>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span>Distance</span>
                  <span className="font-semibold">{fareEstimate.estimatedDistance} km</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Duration</span>
                  <span className="font-semibold">{fareEstimate.estimatedDuration} min</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Estimated Fare</span>
                  <span>${fareEstimate.totalFare}</span>
                </div>
              </div>

              <button
                onClick={confirmRide}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-700"
              >
                Request Ride
              </button>
            </div>
          )}

          {step === 'finding' && (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Finding nearby drivers...</h2>
              <p className="text-gray-600 mb-4">This usually takes a few seconds</p>
              <button
                onClick={cancelRide}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'active' && currentRide && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your driver is on the way</h2>
              {currentRide.driver && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {currentRide.driver.name?.[0] || 'D'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{currentRide.driver.name}</p>
                      <p className="text-sm text-gray-600">
                        {currentRide.driver.vehicle?.make} {currentRide.driver.vehicle?.model}
                      </p>
                      <p className="text-sm text-gray-600">{currentRide.driver.vehicle?.plate}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={cancelRide}
                className="w-full border border-red-500 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50"
              >
                Cancel Ride
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
