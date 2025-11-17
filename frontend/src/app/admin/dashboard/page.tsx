'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'stats' | 'rides' | 'drivers' | 'settings'>('stats')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminAPI.getStats()
      return response.data
    },
    enabled: status === 'authenticated',
  })

  const { data: ridesData } = useQuery({
    queryKey: ['admin-rides'],
    queryFn: async () => {
      const response = await adminAPI.getRides({ limit: 20 })
      return response.data
    },
    enabled: activeTab === 'rides',
  })

  const { data: driversData } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const response = await adminAPI.getDrivers({ limit: 20 })
      return response.data
    },
    enabled: activeTab === 'drivers',
  })

  const verifyDriver = async (driverId: string, isVerified: boolean) => {
    try {
      await adminAPI.verifyDriver(driverId, isVerified)
      window.location.reload()
    } catch (error) {
      console.error('Failed to verify driver:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary-600 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'stats' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('rides')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'rides' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Rides
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'drivers' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Drivers
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Riders</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.totalRiders}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Drivers</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.totalDrivers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Rides</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.totalRides}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Active Rides</h3>
              <p className="text-4xl font-bold text-green-600">{stats.activeRides}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Completed Rides</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.completedRides}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
              <p className="text-4xl font-bold text-green-600">${stats.totalRevenue?.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Available Drivers</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.availableDrivers}</p>
            </div>
          </div>
        )}

        {activeTab === 'rides' && ridesData && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ridesData.rides?.map((ride: any) => (
                    <tr key={ride.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{ride.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{ride.rider?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{ride.driver?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ride.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          ride.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${ride.totalFare}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && driversData && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {driversData.drivers?.map((driver: any) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{driver.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{driver.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {driver.driverProfile?.vehicleMake} {driver.driverProfile?.vehicleModel}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {driver.driverProfile?.averageRating?.toFixed(1) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          driver.driverProfile?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {driver.driverProfile?.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!driver.driverProfile?.isVerified && (
                          <button
                            onClick={() => verifyDriver(driver.id, true)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Fare ($)</label>
                <input type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" defaultValue="2.50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost per KM ($)</label>
                <input type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" defaultValue="1.50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Minute ($)</label>
                <input type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" defaultValue="0.30" />
              </div>
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
