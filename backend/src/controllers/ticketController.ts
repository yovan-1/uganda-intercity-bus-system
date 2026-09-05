import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const verifyTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingRef } = req.body;

    if (!bookingRef) {
      return res.status(400).json({ success: false, message: 'Booking reference code is required' });
    }

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ bookingRef }, { id: bookingRef }] },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        trip: { include: { route: true, vehicle: true } },
        passengers: { include: { seat: true } },
        payment: true,
        ticket: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid Ticket! Booking reference not found in system.' });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'TICKET INVALID: Booking was CANCELLED.',
        booking,
      });
    }

    // Mark ticket as verified by staff
    if (booking.ticket && req.user) {
      await prisma.ticket.update({
        where: { id: booking.ticket.id },
        data: {
          verifiedAt: new Date(),
          verifiedByStaffId: req.user.id,
        },
      });
    }

    return res.json({
      success: true,
      message: 'VALID TICKET: Passenger Boarding Approved ✅',
      booking,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
