import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// API functions
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  verify: () => api.get('/api/auth/verify'),
}

export const rideAPI = {
  requestRide: (data: any) => api.post('/api/rides/request', data),
  getRide: (rideId: string) => api.get(`/api/rides/${rideId}`),
  getRides: (params?: any) => api.get('/api/rides', { params }),
  cancelRide: (rideId: string, reason: string) =>
    api.post(`/api/rides/${rideId}/cancel`, { reason }),
  getTracking: (rideId: string) => api.get(`/api/rides/${rideId}/tracking`),
}

export const driverAPI = {
  updateProfile: (data: any) => api.put('/api/drivers/profile', data),
  updateAvailability: (isAvailable: boolean) =>
    api.put('/api/drivers/availability', { isAvailable }),
  updateLocation: (latitude: number, longitude: number) =>
    api.post('/api/drivers/location', { latitude, longitude }),
  acceptRide: (rideId: string) => api.post(`/api/drivers/rides/${rideId}/accept`),
  updateRideStatus: (rideId: string, status: string) =>
    api.put(`/api/drivers/rides/${rideId}/status`, { status }),
  getEarnings: (params?: any) => api.get('/api/drivers/earnings', { params }),
}

export const paymentAPI = {
  createIntent: (rideId: string) => api.post('/api/payments/create-intent', { rideId }),
  confirm: (paymentId: string, paymentIntentId: string) =>
    api.post('/api/payments/confirm', { paymentId, paymentIntentId }),
  getMethods: () => api.get('/api/payments/methods'),
  addMethod: (paymentMethodId: string) =>
    api.post('/api/payments/methods', { paymentMethodId }),
}

export const ratingAPI = {
  createRating: (data: any) => api.post('/api/ratings', data),
  getDriverRatings: (driverId: string, params?: any) =>
    api.get(`/api/ratings/driver/${driverId}`, { params }),
}

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getRides: (params?: any) => api.get('/api/admin/rides', { params }),
  getDrivers: (params?: any) => api.get('/api/admin/drivers', { params }),
  verifyDriver: (driverId: string, isVerified: boolean) =>
    api.put(`/api/admin/drivers/${driverId}/verify`, { isVerified }),
  deactivateUser: (userId: string, isActive: boolean) =>
    api.put(`/api/admin/users/${userId}/deactivate`, { isActive }),
  updateSettings: (key: string, value: string, description?: string) =>
    api.put(`/api/admin/settings/${key}`, { value, description }),
  getSettings: () => api.get('/api/admin/settings'),
  createSurgeArea: (data: any) => api.post('/api/admin/surge-areas', data),
  getSurgeAreas: () => api.get('/api/admin/surge-areas'),
}

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data: any) => api.put('/api/users/profile', data),
  updateRiderProfile: (data: any) => api.put('/api/users/rider-profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/api/users/change-password', { currentPassword, newPassword }),
}
