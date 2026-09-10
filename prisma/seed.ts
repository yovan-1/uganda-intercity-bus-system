import { PrismaClient, Role, UserStatus, VehicleStatus, TripStatus, PaymentStatus, BookingStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Uganda Intercity Travel Reservation Database Seed...');

  // Clean existing tables
  await prisma.ticket.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.passenger.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Default Users (Admin, Staff, Customer)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@travel.ug',
      phone: '+256771000001',
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Terminal Staff Officer',
      email: 'staff@travel.ug',
      phone: '+256781000002',
      password: passwordHash,
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Emmanuel Mugisha',
      email: 'passenger@travel.ug',
      phone: '+256701234567',
      password: passwordHash,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Default accounts created:');
  console.log('   Admin: admin@travel.ug / Password123!');
  console.log('   Staff: staff@travel.ug / Password123!');
  console.log('   Customer: passenger@travel.ug / Password123!');

  // 2. Create Vehicles & Generate Seats
  const vehicleData = [
    { regNumber: 'UBF 892K', model: 'Scania Touring VIP', operatorName: 'Uganda Coach Express', driverName: 'Tumusiime John', seats: 36 },
    { regNumber: 'UBG 421X', model: 'Scania Marcopolo G7', operatorName: 'Global Coach', driverName: 'Kato Paul', seats: 36 },
    { regNumber: 'UBH 890Y', model: 'Isuzu Luxury Coach', operatorName: 'Link Bus', driverName: 'Okello Denis', seats: 36 },
    { regNumber: 'UBL 102Z', model: 'Volvo B11R VIP', operatorName: 'Jaguar Executive', driverName: 'Mwesigwa Alex', seats: 28 },
    { regNumber: 'UBJ 773Q', model: 'Horizon Highliner', operatorName: 'Horizon Executive', driverName: 'Ahebwa Innocent', seats: 36 },
  ];

  const createdVehicles = [];

  for (const vData of vehicleData) {
    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber: vData.regNumber,
        model: vData.model,
        totalSeats: vData.seats,
        operatorName: vData.operatorName,
        driverName: vData.driverName,
        status: VehicleStatus.ACTIVE,
      },
    });

    // Generate seats grid (Row 1..9, Col 1..4 => 1A, 1B, 1C, 1D)
    const seatsToCreate = [];
    const rows = Math.ceil(vData.seats / 4);
    const cols = ['A', 'B', 'C', 'D'];

    let count = 0;
    for (let r = 1; r <= rows; r++) {
      for (let c = 0; c < 4; c++) {
        if (count >= vData.seats) break;
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
    createdVehicles.push(vehicle);
  }

  console.log(`✅ Created ${createdVehicles.length} fleet vehicles with interactive seats layout.`);

  // 3. Create Routes
  const routeData = [
    { origin: 'Kampala', destination: 'Mbarara', distanceKm: 280, estimatedDuration: '4h 30m', basePriceUGX: 30000 },
    { origin: 'Mbarara', destination: 'Kampala', distanceKm: 280, estimatedDuration: '4h 30m', basePriceUGX: 30000 },
    { origin: 'Kampala', destination: 'Kabale', distanceKm: 410, estimatedDuration: '7h 00m', basePriceUGX: 45000 },
    { origin: 'Kabale', destination: 'Kampala', distanceKm: 410, estimatedDuration: '7h 00m', basePriceUGX: 45000 },
    { origin: 'Kampala', destination: 'Fort Portal', distanceKm: 300, estimatedDuration: '5h 00m', basePriceUGX: 35000 },
    { origin: 'Kampala', destination: 'Gulu', distanceKm: 335, estimatedDuration: '5h 30m', basePriceUGX: 40000 },
    { origin: 'Kampala', destination: 'Jinja', distanceKm: 80, estimatedDuration: '2h 00m', basePriceUGX: 15000 },
    { origin: 'Kampala', destination: 'Masaka', distanceKm: 130, estimatedDuration: '2h 30m', basePriceUGX: 20000 },
    { origin: 'Mbarara', destination: 'Kabale', distanceKm: 130, estimatedDuration: '2h 30m', basePriceUGX: 20000 },
  ];

  const createdRoutes = [];
  for (const rData of routeData) {
    const route = await prisma.route.create({ data: rData });
    createdRoutes.push(route);
  }

  console.log(`✅ Created ${createdRoutes.length} East African bus routes.`);

  // 4. Create Scheduled Trips across all routes for 30 days
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const dailyTemplates = [
    { rIdx: 0, vIdx: 0, h: 6, m: 30, dur: 4.5, price: 30000 },  // Kampala -> Mbarara
    { rIdx: 0, vIdx: 1, h: 8, m: 30, dur: 4.5, price: 30000 },
    { rIdx: 0, vIdx: 2, h: 10, m: 30, dur: 4.5, price: 35000 },
    { rIdx: 0, vIdx: 0, h: 14, m: 0, dur: 4.5, price: 30000 },
    { rIdx: 0, vIdx: 1, h: 16, m: 30, dur: 4.5, price: 35000 },
    { rIdx: 0, vIdx: 2, h: 21, m: 0, dur: 4.5, price: 35000 },

    { rIdx: 1, vIdx: 0, h: 6, m: 0, dur: 4.5, price: 30000 },   // Mbarara -> Kampala
    { rIdx: 1, vIdx: 1, h: 9, m: 0, dur: 4.5, price: 30000 },
    { rIdx: 1, vIdx: 2, h: 13, m: 0, dur: 4.5, price: 35000 },
    { rIdx: 1, vIdx: 0, h: 17, m: 0, dur: 4.5, price: 30000 },

    { rIdx: 2, vIdx: 2, h: 7, m: 0, dur: 7.0, price: 45000 },   // Kampala -> Kabale
    { rIdx: 2, vIdx: 1, h: 11, m: 0, dur: 7.0, price: 45000 },
    { rIdx: 2, vIdx: 2, h: 15, m: 0, dur: 7.0, price: 50000 },

    { rIdx: 3, vIdx: 2, h: 6, m: 30, dur: 7.0, price: 45000 },  // Kabale -> Kampala
    { rIdx: 3, vIdx: 1, h: 11, m: 30, dur: 7.0, price: 45000 },

    { rIdx: 4, vIdx: 1, h: 7, m: 30, dur: 5.0, price: 35000 },  // Kampala -> Fort Portal
    { rIdx: 4, vIdx: 0, h: 13, m: 30, dur: 5.0, price: 35000 },

    { rIdx: 5, vIdx: 4, h: 7, m: 0, dur: 5.5, price: 40000 },   // Kampala -> Gulu
    { rIdx: 5, vIdx: 4, h: 14, m: 0, dur: 5.5, price: 40000 },

    { rIdx: 6, vIdx: 3, h: 8, m: 0, dur: 2.0, price: 15000 },   // Kampala -> Jinja
    { rIdx: 6, vIdx: 3, h: 12, m: 0, dur: 2.0, price: 15000 },
    { rIdx: 6, vIdx: 3, h: 16, m: 30, dur: 2.0, price: 15000 },

    { rIdx: 7, vIdx: 0, h: 8, m: 30, dur: 2.5, price: 20000 },  // Kampala -> Masaka
    { rIdx: 7, vIdx: 1, h: 14, m: 30, dur: 2.5, price: 20000 },

    { rIdx: 8, vIdx: 2, h: 9, m: 0, dur: 2.5, price: 20000 },   // Mbarara -> Kabale
    { rIdx: 8, vIdx: 2, h: 15, m: 0, dur: 2.5, price: 20000 },
  ];

  const createdTrips = [];

  for (let day = 0; day < 30; day++) {
    for (const t of dailyTemplates) {
      const route = createdRoutes[t.rIdx];
      const vehicle = createdVehicles[t.vIdx % createdVehicles.length];

      const depTime = new Date(baseDate);
      depTime.setDate(depTime.getDate() + day);
      depTime.setHours(t.h, t.m, 0, 0);

      const arrTime = new Date(depTime.getTime() + t.dur * 60 * 60 * 1000);

      const trip = await prisma.trip.create({
        data: {
          routeId: route.id,
          vehicleId: vehicle.id,
          departureTime: depTime,
          arrivalTime: arrTime,
          priceUGX: t.price,
          availableSeats: vehicle.totalSeats - 2,
          status: TripStatus.SCHEDULED,
        },
      });
      createdTrips.push(trip);
    }
  }

  console.log(`✅ Created ${createdTrips.length} scheduled bus trips over 30 days.`);

  // 5. Create Demo Booking with Seats & Digital Ticket for Customer
  const firstTrip = createdTrips[0];
  const vehicleSeats = await prisma.seat.findMany({ where: { vehicleId: firstTrip.vehicleId }, take: 2 });

  if (vehicleSeats.length >= 2) {
    const bookingRef = 'UG-8942-XJ';
    const totalFare = firstTrip.priceUGX * 2;

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: customer.id,
        tripId: firstTrip.id,
        totalAmountUGX: totalFare,
        paymentStatus: PaymentStatus.PAID,
        bookingStatus: BookingStatus.CONFIRMED,
        passengers: {
          create: [
            {
              seatId: vehicleSeats[0].id,
              fullName: 'Emmanuel Mugisha',
              phone: '+256701234567',
              email: 'passenger@travel.ug',
            },
            {
              seatId: vehicleSeats[1].id,
              fullName: 'Godson Atukwase',
              phone: '+256779876543',
              email: 'passenger2@travel.ug',
            },
          ],
        },
        payment: {
          create: {
            transactionRef: 'TX-MOMO-8942001',
            amountUGX: totalFare,
            method: PaymentMethod.MTN_MOMO,
            status: PaymentStatus.PAID,
          },
        },
        ticket: {
          create: {
            ticketCode: 'TKT-UG-8942',
            qrData: JSON.stringify({ ref: bookingRef, passenger: 'Emmanuel Mugisha', route: 'Kampala -> Mbarara' }),
          },
        },
      },
    });

    console.log(`✅ Created Demo Customer Booking: ${booking.bookingRef} (Paid via MTN MoMo)`);
  }

  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
