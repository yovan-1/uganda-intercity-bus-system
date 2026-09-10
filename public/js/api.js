/**
 * UG Express - Travel Booking API Client (Vanilla JavaScript)
 * Communicates with the unchanged Node.js / Express backend via REST
 */

const API_BASE_URL = window.location.port === '5000' 
  ? '/api' 
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('ug_travel_token') || localStorage.getItem('must_travel_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || data?.error || `HTTP error ${response.status}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return { data };
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
    throw err;
  }
}

export const authAPI = {
  login: (email, password) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => 
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => 
    request('/auth/me', { method: 'GET' }),
};

export const tripAPI = {
  getRoutes: () => 
    request('/trips/routes', { method: 'GET' }),
  searchTrips: (query = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    return request(`/trips${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  getTripById: (id) => 
    request(`/trips/${id}`, { method: 'GET' }),
  createTrip: (data) => 
    request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  deleteTrip: (id) => 
    request(`/trips/${id}`, { method: 'DELETE' }),
};

export const bookingAPI = {
  createBooking: (data) => 
    request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getUserBookings: () => 
    request('/bookings/my', { method: 'GET' }),
  getBookingById: (id) => 
    request(`/bookings/${id}`, { method: 'GET' }),
  cancelBooking: (id) => 
    request(`/bookings/${id}/cancel`, { method: 'POST' }),
  getAllBookings: () => 
    request('/bookings/all', { method: 'GET' }),
};

export const ticketAPI = {
  verifyTicket: (bookingRef) => 
    request('/tickets/verify', { method: 'POST', body: JSON.stringify({ bookingRef }) }),
};

export const adminAPI = {
  getStats: () => 
    request('/admin/stats', { method: 'GET' }),
  getUsers: () => 
    request('/admin/users', { method: 'GET' }),
  updateUserRole: (id, role, status) => 
    request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role, status }) }),
  getVehicles: () => 
    request('/vehicles', { method: 'GET' }),
  createVehicle: (data) => 
    request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicleStatus: (id, status) => 
    request(`/vehicles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Expose globally for vanilla scripts
window.API = {
  auth: authAPI,
  trip: tripAPI,
  booking: bookingAPI,
  ticket: ticketAPI,
  admin: adminAPI,
};
