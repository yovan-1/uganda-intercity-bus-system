import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { origin: 'asc' },
    });

    const origins = Array.from(new Set(routes.map((r) => r.origin)));
    const destinations = Array.from(new Set(routes.map((r) => r.destination)));

    return res.json({ success: true, routes, origins, destinations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchTrips = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date, passengers, minPrice, maxPrice, operator, sortBy } = req.query;

    if (origin && destination && origin.toString().trim().toLowerCase() === destination.toString().trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Origin and Destination cannot be the same city',
      });
    }

    const passengerCount = passengers ? parseInt(passengers.toString()) : 1;

    let whereClause: any = {};

    if (origin || destination) {
      whereClause.route = {};
      if (origin) whereClause.route.origin = { equals: origin.toString() };
      if (destination) whereClause.route.destination = { equals: destination.toString() };
    }

    if (operator) {
      whereClause.vehicle = { operatorName: { equals: operator.toString() } };
    }

    if (minPrice || maxPrice) {
      whereClause.priceUGX = {};
      if (minPrice) whereClause.priceUGX.gte = parseInt(minPrice.toString());
      if (maxPrice) whereClause.priceUGX.lte = parseInt(maxPrice.toString());
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        route: true,
        vehicle: true,
      },
    });

    // Client-side filtering by date if specified
    let filteredTrips = trips;
    if (date) {
      const searchDateStr = date.toString().trim();
      const searchDate = new Date(searchDateStr).toISOString().split('T')[0];
      const exactMatches = trips.filter((t) => {
        const tripDate = new Date(t.departureTime).toISOString().split('T')[0];
        return tripDate === searchDate;
      });

      if (exactMatches.length > 0) {
        filteredTrips = exactMatches;
      } else {
        // Fallback to upcoming scheduled departures from this date onwards
        filteredTrips = trips.filter((t) => {
          const tripDate = new Date(t.departureTime).toISOString().split('T')[0];
          return tripDate >= searchDate;
        });
      }
    }

    // Filter available seats
    filteredTrips = filteredTrips.filter((t) => t.availableSeats >= passengerCount);

    // Sorting (default to earliest departure)
    if (sortBy === 'cheapest') {
      filteredTrips.sort((a, b) => a.priceUGX - b.priceUGX);
    } else if (sortBy === 'shortest') {
      filteredTrips.sort((a, b) => a.route.distanceKm - b.route.distanceKm);
    } else {
      filteredTrips.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }

    return res.json({
      success: true,
      count: filteredTrips.length,
      trips: filteredTrips,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        route: true,
        vehicle: {
          include: {
            seats: {
              orderBy: [{ seatRow: 'asc' }, { seatCol: 'asc' }],
            },
          },
        },
        bookings: {
          where: { bookingStatus: { in: ['CONFIRMED', 'PENDING'] } },
          include: {
            passengers: {
              select: { seatId: true },
            },
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Extract occupied seat IDs for this trip
    const occupiedSeatIds = trip.bookings.flatMap((b) => b.passengers.map((p) => p.seatId));

    return res.json({
      success: true,
      trip: {
        ...trip,
        occupiedSeatIds,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { routeId, vehicleId, departureTime, arrivalTime, priceUGX } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'Selected vehicle does not exist' });
    }

    const trip = await prisma.trip.create({
      data: {
        routeId,
        vehicleId,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        priceUGX: parseInt(priceUGX),
        availableSeats: vehicle.totalSeats,
      },
      include: { route: true, vehicle: true },
    });

    return res.status(201).json({ success: true, trip });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.trip.delete({ where: { id } });
    return res.json({ success: true, message: 'Trip cancelled and removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
