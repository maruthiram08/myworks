'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { driverAPI } from '@/lib/api'
import { useSocket, socketOn, socketOff, socketEmit } from '@/lib/socket'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

export default function DriverDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { socket, isConnected } = useSocket()

  const [isAvailable, setIsAvailable] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [rideRequests, setRideRequests] = useState<any[]>([])
  const [currentRide, setCurrentRide] = useState<any>(null)
  const [rideStatus, setRideStatus] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'DRIVER') {
      router.push('/')
    }
  }, [session, status, router])

  // Get location updates
  useEffect(() => {
    if (!isAvailable) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })

        // Update location on server and via WebSocket
        driverAPI.updateLocation(latitude, longitude)
        socketEmit('driver:location:update', {
          latitude,
          longitude,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Unable to get location')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isAvailable])

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return

    socketOn('ride:new_request', (data: any) => {
      setRideRequests((prev) => [...prev, data])
      toast.success('New ride request nearby!')
    })

    socketOn('ride:taken', (data: any) => {
      setRideRequests((prev) => prev.filter((r) => r.rideId !== data.rideId))
    })

    socketOn('ride:cancelled', (data: any) => {
      toast.info('Ride was cancelled by rider')
      setCurrentRide(null)
      setRideStatus('')
    })

    return () => {
      socketOff('ride:new_request')
      socketOff('ride:taken')
      socketOff('ride:cancelled')
    }
  }, [socket])

  const toggleAvailability = async () => {
    try {
      await driverAPI.updateAvailability(!isAvailable)
      setIsAvailable(!isAvailable)
      toast.success(isAvailable ? 'You are now offline' : 'You are now online')
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const acceptRide = async (rideId: string) => {
    try {
      const response = await driverAPI.acceptRide(rideId)
      setCurrentRide(response.data.ride)
      setRideStatus('ACCEPTED')
      setRideRequests([])
      socketEmit('ride:accept', { rideId })
      toast.success('Ride accepted!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept ride')
    }
  }

  const updateRideStatus = async (status: string) => {
    if (!currentRide) return

    try {
      await driverAPI.updateRideStatus(currentRide.id, status)
      setRideStatus(status)
      socketEmit('ride:status:update', { rideId: currentRide.id, status })

      if (status === 'COMPLETED') {
        toast.success('Ride completed!')
        setCurrentRide(null)
        setRideStatus('')
      } else {
        toast.success(`Status updated to ${status}`)
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const markers = []
  if (location) {
    markers.push({
      id: 'driver',
      latitude: location.latitude,
      longitude: location.longitude,
      type: 'driver' as const,
      label: 'You',
    })
  }
  if (currentRide) {
    markers.push({
      id: 'pickup',
      latitude: currentRide.pickupLatitude,
      longitude: currentRide.pickupLongitude,
      type: 'pickup' as const,
      label: 'Pickup',
    })
    markers.push({
      id: 'dropoff',
      latitude: currentRide.dropoffLatitude,
      longitude: currentRide.dropoffLongitude,
      type: 'dropoff' as const,
      label: 'Dropoff',
    })
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Driver Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-lg font-semibold ${
                isAvailable ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              {isAvailable ? 'Online' : 'Offline'}
            </button>
            <button
              onClick={() => router.push('/driver/earnings')}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-semibold"
            >
              Earnings
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <Map
          center={location ? [location.longitude, location.latitude] : undefined}
          markers={markers}
          showRoute={!!currentRide}
          routeCoordinates={
            currentRide
              ? [
                  [currentRide.pickupLongitude, currentRide.pickupLatitude],
                  [currentRide.dropoffLongitude, currentRide.dropoffLatitude],
                ]
              : []
          }
        />

        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-96 overflow-y-auto">
          {!isAvailable && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-2">You're offline</h2>
              <p className="text-gray-600 mb-4">Go online to start receiving ride requests</p>
              <button
                onClick={toggleAvailability}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
              >
                Go Online
              </button>
            </div>
          )}

          {isAvailable && !currentRide && rideRequests.length === 0 && (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Looking for rides...</h2>
              <p className="text-gray-600">You'll be notified when new requests come in</p>
            </div>
          )}

          {isAvailable && !currentRide && rideRequests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Ride Requests</h2>
              {rideRequests.map((request) => (
                <div key={request.rideId} className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{request.pickup.address}</p>
                      <p className="text-sm text-gray-600">to {request.dropoff?.address}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Distance: ~{request.distance?.toFixed(1)} km
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${request.fare}</p>
                  </div>
                  <button
                    onClick={() => acceptRide(request.rideId)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                  >
                    Accept Ride
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentRide && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Current Ride</h2>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="font-semibold">{currentRide.pickupAddress}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Dropoff</p>
                  <p className="font-semibold">{currentRide.dropoffAddress}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fare</span>
                  <span className="font-bold text-xl">${currentRide.totalFare}</span>
                </div>
              </div>

              {rideStatus === 'ACCEPTED' && (
                <button
                  onClick={() => updateRideStatus('DRIVER_ARRIVED')}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-700 mb-2"
                >
                  I've Arrived
                </button>
              )}

              {rideStatus === 'DRIVER_ARRIVED' && (
                <button
                  onClick={() => updateRideStatus('IN_PROGRESS')}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 mb-2"
                >
                  Start Trip
                </button>
              )}

              {rideStatus === 'IN_PROGRESS' && (
                <button
                  onClick={() => updateRideStatus('COMPLETED')}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 mb-2"
                >
                  Complete Trip
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
