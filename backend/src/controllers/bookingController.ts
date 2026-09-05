import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { PaymentMethod, PaymentStatus, BookingStatus } from '@prisma/client';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Must be logged in to create booking' });
    }

    const { tripId, passengerDetails, paymentMethod } = req.body;

    if (!tripId || !passengerDetails || !Array.isArray(passengerDetails) || passengerDetails.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid trip or passenger details' });
    }

    // 1. Fetch trip and check capacity
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        vehicle: true,
        route: true,
        bookings: {
          where: { bookingStatus: { in: ['CONFIRMED', 'PENDING'] } },
          include: { passengers: { select: { seatId: true } } },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // 2. Validate seat availability
    const occupiedSeatIds = new Set(trip.bookings.flatMap((b) => b.passengers.map((p) => p.seatId)));
    const requestedSeatIds = passengerDetails.map((p: any) => p.seatId);

    for (const seatId of requestedSeatIds) {
      if (occupiedSeatIds.has(seatId)) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected seats are already occupied. Please choose different seats.',
        });
      }
    }

    // Server-side Passenger Input Validation
    const ugPhoneRegex = /^(\+256|0)(77|78|70|75|76)[0-9]{7}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s'-]+$/;

    for (let i = 0; i < passengerDetails.length; i++) {
      const p = passengerDetails[i];
      if (!p.fullName || !nameRegex.test(p.fullName)) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} has an invalid name. Only letters, spaces, hyphens allowed.`,
        });
      }
      if (!p.phone || !ugPhoneRegex.test(p.phone.replace(/\s+/g, ''))) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} phone number must be a valid Ugandan phone number (e.g. 0771234567 or +256771234567).`,
        });
      }
      if (!p.email || !emailRegex.test(p.email)) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} email address is invalid.`,
        });
      }
    }

    // 3. Generate unique booking ref
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const charPart = Math.random().toString(36).substring(2, 4).toUpperCase();
    const bookingRef = `MUST-${randPart}-${charPart}`;

    const totalFare = trip.priceUGX * passengerDetails.length;

    // Map payment method
    let methodEnum: PaymentMethod = PaymentMethod.MTN_MOMO;
    if (paymentMethod === 'AIRTEL_MONEY') methodEnum = PaymentMethod.AIRTEL_MONEY;
    if (paymentMethod === 'VISA_CARD') methodEnum = PaymentMethod.VISA_CARD;

    const txRef = `TX-${methodEnum.substring(0, 4)}-${Date.now().toString().slice(-6)}`;

    // 4. Create Booking transaction
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: req.user.id,
        tripId: trip.id,
        totalAmountUGX: totalFare,
        paymentStatus: PaymentStatus.PAID,
        bookingStatus: BookingStatus.CONFIRMED,
        passengers: {
          create: passengerDetails.map((p: any) => ({
            seatId: p.seatId,
            fullName: p.fullName,
            phone: p.phone,
            email: p.email,
          })),
        },
        payment: {
          create: {
            transactionRef: txRef,
            amountUGX: totalFare,
            method: methodEnum,
            status: PaymentStatus.PAID,
          },
        },
        ticket: {
          create: {
            ticketCode: `TKT-${bookingRef}`,
            qrData: JSON.stringify({
              ref: bookingRef,
              trip: `${trip.route.origin} -> ${trip.route.destination}`,
              departure: trip.departureTime,
              passengersCount: passengerDetails.length,
            }),
          },
        },
      },
      include: {
        trip: { include: { route: true, vehicle: true } },
        passengers: { include: { seat: true } },
        payment: true,
        ticket: true,
      },
    });

    // 5. Update remaining seats count
    await prisma.trip.update({
      where: { id: trip.id },
      data: { availableSeats: { decrement: passengerDetails.length } },
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Booking creation failed' });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        trip: { include: { route: true, vehicle: true } },
        passengers: { include: { seat: true } },
        payment: true,
        ticket: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingRef: id }] },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        trip: { include: { route: true, vehicle: true } },
        passengers: { include: { seat: true } },
        payment: true,
        ticket: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    return res.json({ success: true, booking });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { passengers: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: Admin or owner
    if (req.user?.role !== 'ADMIN' && booking.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: BookingStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    // Restoring seats
    await prisma.trip.update({
      where: { id: booking.tripId },
      data: { availableSeats: { increment: booking.passengers.length } },
    });

    return res.json({ success: true, message: 'Booking cancelled successfully', booking: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        trip: { include: { route: true, vehicle: true } },
        passengers: { include: { seat: true } },
        payment: true,
        ticket: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
