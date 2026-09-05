export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDuration: string;
  basePriceUGX: number;
}

export interface Seat {
  id: string;
  vehicleId: string;
  seatNumber: string;
  seatRow: number;
  seatCol: number;
  isAccessible: boolean;
  isAvailable?: boolean;
}

export interface Vehicle {
  id: string;
  regNumber: string;
  model: string;
  totalSeats: number;
  operatorName: string;
  driverName: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  seats?: Seat[];
}

export interface Trip {
  id: string;
  routeId: string;
  vehicleId: string;
  departureTime: string;
  arrivalTime: string;
  priceUGX: number;
  availableSeats: number;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  route: Route;
  vehicle: Vehicle;
  occupiedSeatIds?: string[];
  seats?: Seat[];
}

export interface PassengerInput {
  seatId: string;
  seatNumber: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  tripId: string;
  totalAmountUGX: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  bookingStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  user?: User;
  trip: Trip;
  passengers: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    seat: Seat;
  }[];
  payment?: {
    id: string;
    transactionRef: string;
    amountUGX: number;
    method: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'VISA_CARD';
    status: 'PAID' | 'FAILED';
    paidAt: string;
  };
  ticket?: {
    id: string;
    ticketCode: string;
    qrData: string;
    issuedAt: string;
    verifiedAt?: string;
  };
}

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}
