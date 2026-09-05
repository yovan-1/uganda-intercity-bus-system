import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalVehicles = await prisma.vehicle.count();
    const totalTrips = await prisma.trip.count();
    const totalBookings = await prisma.booking.count();

    // Calculate revenue in UGX for confirmed/paid bookings
    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID', bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] } },
      select: { totalAmountUGX: true },
    });

    const totalRevenueUGX = paidBookings.reduce((sum, b) => sum + b.totalAmountUGX, 0);

    // Today's bookings count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysBookingsCount = await prisma.booking.count({
      where: { createdAt: { gte: startOfToday } },
    });

    // Recent 5 bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        trip: { include: { route: true } },
      },
    });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalVehicles,
        totalTrips,
        totalBookings,
        todaysBookingsCount,
        totalRevenueUGX,
      },
      recentBookings,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return res.json({ success: true, message: 'User updated successfully', user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
