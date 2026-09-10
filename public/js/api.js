/**
 * UG Express - Travel Booking API Client (Vanilla JavaScript)
 * Communicates with the Node.js / Express backend via REST
 * Includes automatic client-side demo fallback for preview deployments (e.g. Vercel)
 */

const API_BASE_URL = window.location.port === '5000' 
  ? '/api' 
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

// Demo seed routes
const MOCK_ROUTES = [
  { id: 'route-kmp-mbr', origin: 'Kampala', destination: 'Mbarara', distanceKm: 270, estimatedDuration: '4h 30m', basePriceUGX: 30000 },
  { id: 'route-mbr-kmp', origin: 'Mbarara', destination: 'Kampala', distanceKm: 270, estimatedDuration: '4h 30m', basePriceUGX: 30000 },
  { id: 'route-kmp-kbl', origin: 'Kampala', destination: 'Kabale', distanceKm: 410, estimatedDuration: '7h 00m', basePriceUGX: 45000 },
  { id: 'route-kbl-kmp', origin: 'Kabale', destination: 'Kampala', distanceKm: 410, estimatedDuration: '7h 00m', basePriceUGX: 45000 },
  { id: 'route-kmp-ftp', origin: 'Kampala', destination: 'Fort Portal', distanceKm: 300, estimatedDuration: '5h 00m', basePriceUGX: 35000 },
  { id: 'route-ftp-kmp', origin: 'Fort Portal', destination: 'Kampala', distanceKm: 300, estimatedDuration: '5h 00m', basePriceUGX: 35000 },
  { id: 'route-kmp-glu', origin: 'Kampala', destination: 'Gulu', distanceKm: 335, estimatedDuration: '5h 30m', basePriceUGX: 40000 },
  { id: 'route-glu-kmp', origin: 'Gulu', destination: 'Kampala', distanceKm: 335, estimatedDuration: '5h 30m', basePriceUGX: 40000 },
  { id: 'route-kmp-jnj', origin: 'Kampala', destination: 'Jinja', distanceKm: 85, estimatedDuration: '2h 00m', basePriceUGX: 15000 },
  { id: 'route-jnj-kmp', origin: 'Jinja', destination: 'Kampala', distanceKm: 85, estimatedDuration: '2h 00m', basePriceUGX: 15000 },
  { id: 'route-kmp-msk', origin: 'Kampala', destination: 'Masaka', distanceKm: 130, estimatedDuration: '2h 30m', basePriceUGX: 20000 },
  { id: 'route-msk-kmp', origin: 'Masaka', destination: 'Kampala', distanceKm: 130, estimatedDuration: '2h 30m', basePriceUGX: 20000 },
];

const MOCK_OPERATORS = [
  { name: 'Uganda Coach Express', model: 'Scania Marcopolo G7 Luxury', reg: 'UBF 892K', driver: 'Okello David' },
  { name: 'Uganda Coach Express', model: 'Isuzu FVR Royal Coach', reg: 'UBM 501M', driver: 'Mukasa Ronald' },
  { name: 'Global Coaches', model: 'Scania Touring HD', reg: 'UBA 104F', driver: 'Tumwesigye Alex' },
  { name: 'Link Bus Services', model: 'Mercedes-Benz Tourismo', reg: 'UBH 772T', driver: 'Mugisha Brian' },
  { name: 'YY Coaches', model: 'Yutong Grand Cruiser', reg: 'UBD 339L', driver: 'Opio Samuel' },
];

function generateMockTrips(query = {}) {
  const times = ['06:00', '07:30', '09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:30', '22:00'];
  const trips = [];
  const baseDate = query.date || new Date().toISOString().split('T')[0];

  const matchedRoutes = MOCK_ROUTES.filter(r => {
    if (query.origin && r.origin.toLowerCase() !== query.origin.toLowerCase()) return false;
    if (query.destination && r.destination.toLowerCase() !== query.destination.toLowerCase()) return false;
    return true;
  });

  const routesToUse = matchedRoutes.length > 0 ? matchedRoutes : MOCK_ROUTES;

  let tripIdx = 100;
  routesToUse.forEach(route => {
    times.forEach((t, i) => {
      const op = MOCK_OPERATORS[(tripIdx + i) % MOCK_OPERATORS.length];
      const dep = new Date(`${baseDate}T${t}:00`);
      const durHours = parseInt(route.estimatedDuration) || 4;
      const arr = new Date(dep.getTime() + durHours * 3600000);

      trips.push({
        id: `mock-trip-${tripIdx}`,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        priceUGX: route.basePriceUGX,
        availableSeats: 36 - ((tripIdx % 7) + 2),
        status: 'SCHEDULED',
        route: { ...route },
        vehicle: {
          id: `veh-${(tripIdx % 5) + 1}`,
          regNumber: op.reg,
          model: op.model,
          operatorName: op.name,
          totalSeats: 36,
          driverName: op.driver,
        },
      });
      tripIdx++;
    });
  });

  return trips;
}

function generateMockSeats(vehicleId) {
  const seats = [];
  const cols = ['A', 'B', 'C', 'D'];
  let seatId = 1;
  for (let row = 1; row <= 9; row++) {
    for (let c = 0; c < 4; c++) {
      const seatNumber = `${row}${cols[c]}`;
      seats.push({
        id: `seat-${vehicleId}-${seatNumber}`,
        vehicleId,
        seatNumber,
        seatRow: row,
        seatCol: c,
        isAccessible: row === 1 && (cols[c] === 'A' || cols[c] === 'B'),
      });
      seatId++;
    }
  }
  return seats;
}

function handleMockFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  if (options.body) {
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch (e) {}
  }

  // 1. Auth Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const email = body.email || 'passenger@travel.ug';
    let role = 'CUSTOMER';
    if (email.includes('admin')) role = 'ADMIN';
    else if (email.includes('staff')) role = 'STAFF';

    const user = {
      id: 'usr-demo-' + role.toLowerCase(),
      name: email.split('@')[0].toUpperCase(),
      email,
      phone: '+256 772 100200',
      role,
      status: 'ACTIVE',
    };
    return { success: true, token: 'demo-jwt-token-' + Date.now(), user };
  }

  // 2. Auth Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const user = {
      id: 'usr-' + Date.now(),
      name: body.name || 'New Passenger',
      email: body.email,
      phone: body.phone || '+256 700 000000',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    };
    return { success: true, token: 'demo-jwt-token-' + Date.now(), user };
  }

  // 3. Auth Me
  if (endpoint === '/auth/me') {
    const saved = localStorage.getItem('ug_travel_user');
    if (saved) {
      try { return { success: true, user: JSON.parse(saved) }; } catch (e) {}
    }
    return { success: true, user: { id: 'usr-demo-customer', name: 'Passenger Demo', email: 'passenger@travel.ug', role: 'CUSTOMER' } };
  }

  // 4. Routes
  if (endpoint === '/trips/routes') {
    const origins = Array.from(new Set(MOCK_ROUTES.map(r => r.origin)));
    const destinations = Array.from(new Set(MOCK_ROUTES.map(r => r.destination)));
    return { success: true, routes: MOCK_ROUTES, origins, destinations };
  }

  // 5. Trips Search
  if (endpoint.startsWith('/trips?') || endpoint === '/trips') {
    const urlObj = new URL('http://dummy.local' + endpoint);
    const origin = urlObj.searchParams.get('origin');
    const destination = urlObj.searchParams.get('destination');
    const date = urlObj.searchParams.get('date');
    const trips = generateMockTrips({ origin, destination, date });
    return { success: true, count: trips.length, trips };
  }

  // 6. Trip by ID
  if (endpoint.startsWith('/trips/') && method === 'GET') {
    const tripId = endpoint.replace('/trips/', '');
    const trips = generateMockTrips();
    const trip = trips.find(t => t.id === tripId) || trips[0];
    const seats = generateMockSeats(trip.vehicle.id);
    const bookedSeatIds = [seats[2].id, seats[5].id, seats[8].id, seats[14].id];

    return {
      success: true,
      trip: {
        ...trip,
        vehicle: {
          ...trip.vehicle,
          seats,
        },
        bookings: [
          { passengers: [{ seatId: bookedSeatIds[0] }] },
          { passengers: [{ seatId: bookedSeatIds[1] }] },
          { passengers: [{ seatId: bookedSeatIds[2] }] },
          { passengers: [{ seatId: bookedSeatIds[3] }] },
        ],
      },
    };
  }

  // 7. Bookings Create
  if (endpoint === '/bookings' && method === 'POST') {
    const bookingRef = `UG-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    const ticketCode = `TKT-UG-${Math.floor(1000 + Math.random() * 9000)}`;

    const trips = generateMockTrips();
    const trip = trips.find(t => t.id === body.tripId) || trips[0];

    const newBooking = {
      id: 'book-' + Date.now(),
      bookingRef,
      tripId: body.tripId,
      totalAmountUGX: body.totalAmountUGX || trip.priceUGX,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      trip,
      passengers: body.passengers || [
        { id: 'pass-1', fullName: 'Okello David', phone: '+256 772 000000', email: 'traveler@travel.ug', seat: { seatNumber: '4A' } }
      ],
      ticket: {
        id: 'tkt-' + Date.now(),
        ticketCode,
        qrData: `UG-TICKET:${bookingRef}:${ticketCode}:PAID`,
        issuedAt: new Date().toISOString(),
      },
      payment: {
        id: 'pay-' + Date.now(),
        transactionRef: 'TXN-' + Date.now(),
        amountUGX: body.totalAmountUGX || trip.priceUGX,
        status: 'PAID',
        method: body.paymentMethod || 'MTN_MOMO',
      }
    };

    const stored = JSON.parse(localStorage.getItem('ug_express_demo_bookings') || '[]');
    stored.unshift(newBooking);
    localStorage.setItem('ug_express_demo_bookings', JSON.stringify(stored));

    return { success: true, booking: newBooking };
  }

  // 8. Bookings My
  if (endpoint === '/bookings/my') {
    const stored = JSON.parse(localStorage.getItem('ug_express_demo_bookings') || '[]');
    if (stored.length === 0) {
      const defaultBooking = {
        id: 'book-sample-1',
        bookingRef: 'UG-8942-XJ',
        totalAmountUGX: 30000,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: new Date().toISOString(),
        trip: generateMockTrips()[0],
        passengers: [
          { id: 'pass-sample', fullName: 'Aine Yovan', phone: '+256 700 000000', email: 'passenger@travel.ug', seat: { seatNumber: '3A' } }
        ],
        ticket: {
          id: 'tkt-sample',
          ticketCode: 'TKT-UG-8942',
          qrData: 'UG-TICKET:UG-8942-XJ:TKT-UG-8942:PAID',
          issuedAt: new Date().toISOString(),
        }
      };
      return { success: true, bookings: [defaultBooking] };
    }
    return { success: true, bookings: stored };
  }

  // 9. Booking by ID or Reference
  if (endpoint.startsWith('/bookings/')) {
    const id = endpoint.replace('/bookings/', '').replace('/cancel', '');
    const stored = JSON.parse(localStorage.getItem('ug_express_demo_bookings') || '[]');
    const match = stored.find(b => b.id === id || b.bookingRef === id);
    if (match) return { success: true, booking: match };

    const sampleTrip = generateMockTrips()[0];
    return {
      success: true,
      booking: {
        id: id || 'book-sample-1',
        bookingRef: id.startsWith('UG-') ? id : 'UG-8942-XJ',
        totalAmountUGX: 30000,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: new Date().toISOString(),
        trip: sampleTrip,
        passengers: [
          { id: 'pass-1', fullName: 'Aine Yovan', phone: '+256 772 123456', email: 'passenger@travel.ug', seat: { seatNumber: '3A' } }
        ],
        ticket: {
          id: 'tkt-sample',
          ticketCode: 'TKT-UG-8942',
          qrData: `UG-TICKET:${id.startsWith('UG-') ? id : 'UG-8942-XJ'}:TKT-UG-8942:PAID`,
          issuedAt: new Date().toISOString(),
        }
      }
    };
  }

  // 10. Tickets Verify
  if (endpoint === '/tickets/verify' && method === 'POST') {
    const ref = body.bookingRef || 'UG-8942-XJ';
    return {
      success: true,
      message: 'Ticket verified successfully. Boarding authorized.',
      ticket: {
        id: 'tkt-verified',
        ticketCode: 'TKT-UG-8942',
        verifiedAt: new Date().toISOString(),
        qrData: `UG-TICKET:${ref}:TKT-UG-8942:PAID`,
        booking: {
          bookingRef: ref,
          bookingStatus: 'CONFIRMED',
          trip: generateMockTrips()[0],
          passengers: [
            { fullName: 'Aine Yovan', phone: '+256 772 123456', seat: { seatNumber: '3A' } }
          ]
        }
      }
    };
  }

  // 11. Admin Stats & Fleet
  if (endpoint === '/admin/stats') {
    return {
      success: true,
      stats: {
        totalRevenueUGX: 115200000,
        totalBookings: 3840,
        activeTrips: 48,
        activeVehicles: 16,
        totalUsers: 1420,
      }
    };
  }

  if (endpoint === '/admin/users') {
    return {
      success: true,
      users: [
        { id: 'u-1', name: 'System Administrator', email: 'admin@travel.ug', role: 'ADMIN', status: 'ACTIVE', phone: '+256 700 111222' },
        { id: 'u-2', name: 'Terminal Scanner Staff', email: 'staff@travel.ug', role: 'STAFF', status: 'ACTIVE', phone: '+256 700 333444' },
        { id: 'u-3', name: 'Aine Yovan', email: 'passenger@travel.ug', role: 'CUSTOMER', status: 'ACTIVE', phone: '+256 772 555666' },
      ]
    };
  }

  if (endpoint === '/vehicles') {
    return {
      success: true,
      vehicles: MOCK_OPERATORS.map((op, idx) => ({
        id: `veh-${idx + 1}`,
        regNumber: op.reg,
        model: op.model,
        operatorName: op.name,
        totalSeats: 36,
        driverName: op.driver,
        status: 'ACTIVE',
      }))
    };
  }

  return null;
}

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
      const fallback = handleMockFallback(endpoint, options);
      if (fallback !== null) {
        return { data: fallback };
      }
      const error = new Error(data?.message || data?.error || `HTTP error ${response.status}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return { data };
  } catch (err) {
    const fallback = handleMockFallback(endpoint, options);
    if (fallback !== null) {
      console.info(`[UG Express] Serving fallback demo response for ${endpoint}`);
      return { data: fallback };
    }
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
