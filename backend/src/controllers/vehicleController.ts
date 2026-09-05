import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: { select: { trips: true, seats: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, vehicles });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { regNumber, model, totalSeats, operatorName, driverName } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { regNumber } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vehicle registration number already exists' });
    }

    const seatsCount = totalSeats ? parseInt(totalSeats) : 36;

    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber,
        model,
        totalSeats: seatsCount,
        operatorName,
        driverName,
      },
    });

    // Auto-create seats layout
    const seatsToCreate = [];
    const rows = Math.ceil(seatsCount / 4);
    const cols = ['A', 'B', 'C', 'D'];
    let count = 0;

    for (let r = 1; r <= rows; r++) {
      for (let c = 0; c < 4; c++) {
        if (count >= seatsCount) break;
        seatsToCreate.push({
          vehicleId: vehicle.id,
          seatNumber: `${r}${cols[c]}`,
          seatRow: r,
          seatCol: c + 1,
          isAccessible: r === 1,
        });
        count++;
      }
    }

    await prisma.seat.createMany({ data: seatsToCreate });

    return res.status(201).json({ success: true, vehicle });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVehicleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, vehicle });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
