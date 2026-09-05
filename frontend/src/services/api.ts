import axios from 'axios';
import { SearchQuery, Booking, Trip, Vehicle, User, Route } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('must_travel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const tripAPI = {
  getRoutes: () => api.get<{ success: boolean; routes: Route[]; origins: string[]; destinations: string[] }>('/trips/routes'),
  searchTrips: (query: Partial<SearchQuery> & { minPrice?: number; maxPrice?: number; operator?: string; sortBy?: string }) =>
    api.get<{ success: boolean; count: number; trips: Trip[] }>('/trips', { params: query }),
  getTripById: (id: string) => api.get<{ success: boolean; trip: Trip }> (`/trips/${id}`),
  createTrip: (data: any) => api.post('/trips', data),
  deleteTrip: (id: string) => api.delete(`/trips/${id}`),
};

export const bookingAPI = {
  createBooking: (data: { tripId: string; passengerDetails: any[]; paymentMethod: string }) =>
    api.post<{ success: boolean; message: string; booking: Booking }>('/bookings', data),
  getUserBookings: () => api.get<{ success: boolean; bookings: Booking[] }>('/bookings/my'),
  getBookingById: (id: string) => api.get<{ success: boolean; booking: Booking }>(`/bookings/${id}`),
  cancelBooking: (id: string) => api.post(`/bookings/${id}/cancel`),
  getAllBookings: () => api.get<{ success: boolean; bookings: Booking[] }>('/bookings/all'),
};

export const ticketAPI = {
  verifyTicket: (bookingRef: string) => api.post('/tickets/verify', { bookingRef }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get<{ success: boolean; users: User[] }>('/admin/users'),
  updateUserRole: (id: string, role: string, status?: string) => api.patch(`/admin/users/${id}`, { role, status }),
  getVehicles: () => api.get<{ success: boolean; vehicles: Vehicle[] }>('/vehicles'),
  createVehicle: (data: any) => api.post('/vehicles', data),
  updateVehicleStatus: (id: string, status: string) => api.patch(`/vehicles/${id}/status`, { status }),
};
