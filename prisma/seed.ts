import { PrismaClient, Role, UserStatus, VehicleStatus, TripStatus, PaymentStatus, BookingStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MUST Travel Reservation Database Seed...');

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
      name: 'Dr. Mugisha Admin',
      email: 'admin@must.ac.ug',
      phone: '+256771000001',
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Kigozi Staff Officer',
      email: 'staff@must.ac.ug',
      phone: '+256781000002',
      password: passwordHash,
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Ikayo Emmanuel',
      email: 'student@must.ac.ug',
      phone: '+256701234567',
      password: passwordHash,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Default accounts created:');
  console.log('   Admin: admin@must.ac.ug / Password123!');
  console.log('   Staff: staff@must.ac.ug / Password123!');
  console.log('   Customer: student@must.ac.ug / Password123!');

  // 2. Create Vehicles & Generate Seats
  const vehicleData = [
    { regNumber: 'UBG 421X', model: 'Scania Marcopolo G7', operatorName: 'Global Coach', driverName: 'Kato Paul', seats: 36 },
    { regNumber: 'UBH 890Y', model: 'Isuzu Luxury Coach', operatorName: 'Link Bus', driverName: 'Okello Denis', seats: 36 },
    { regNumber: 'UBL 102Z', model: 'Volvo B11R VIP', operatorName: 'Jaguar Executive', driverName: 'Mwesigwa Alex', seats: 28 },
    { regNumber: 'UBK 554W', model: 'Yutong Coach 2024', operatorName: 'Mbarara Express', driverName: 'Tumusiime John', seats: 36 },
    { regNumber: 'UBJ 773Q', model: 'Scania Touring VIP', operatorName: 'Horizon Executive', driverName: 'Ahebwa Innocent', seats: 36 },
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

  // 4. Create Scheduled Trips
  const now = new Date();
  const todayMorning = new Date(now);
  todayMorning.setHours(7, 0, 0, 0);

  const todayNoon = new Date(now);
  todayNoon.setHours(12, 30, 0, 0);

  const todayEvening = new Date(now);
  todayEvening.setHours(16, 0, 0, 0);

  const tomorrowMorning = new Date(now);
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(8, 0, 0, 0);

  const nextWeekMorning = new Date(now);
  nextWeekMorning.setDate(nextWeekMorning.getDate() + 5);
  nextWeekMorning.setHours(9, 0, 0, 0);

  const tripTemplates = [
    { routeIdx: 0, vehicleIdx: 0, time: todayMorning, durationHours: 4.5, price: 30000 }, // Kampala -> Mbarara
    { routeIdx: 0, vehicleIdx: 1, time: todayNoon, durationHours: 4.5, price: 30000 },    // Kampala -> Mbarara
    { routeIdx: 0, vehicleIdx: 2, time: todayEvening, durationHours: 4.5, price: 35000 }, // Kampala -> Mbarara VIP
    { routeIdx: 0, vehicleIdx: 3, time: tomorrowMorning, durationHours: 4.5, price: 30000 },// Kampala -> Mbarara tomorrow
    { routeIdx: 1, vehicleIdx: 0, time: todayNoon, durationHours: 4.5, price: 30000 },    // Mbarara -> Kampala
    { routeIdx: 2, vehicleIdx: 2, time: tomorrowMorning, durationHours: 7.0, price: 45000 },// Kampala -> Kabale
    { routeIdx: 4, vehicleIdx: 1, time: nextWeekMorning, durationHours: 5.0, price: 35000 },// Kampala -> Fort Portal
    { routeIdx: 5, vehicleIdx: 4, time: tomorrowMorning, durationHours: 5.5, price: 40000 },// Kampala -> Gulu
    { routeIdx: 6, vehicleIdx: 3, time: todayEvening, durationHours: 2.0, price: 15000 }, // Kampala -> Jinja
  ];

  const createdTrips = [];
  for (const t of tripTemplates) {
    const route = createdRoutes[t.routeIdx];
    const vehicle = createdVehicles[t.vehicleIdx];
    const arrTime = new Date(t.time.getTime() + t.durationHours * 60 * 60 * 1000);

    const trip = await prisma.trip.create({
      data: {
        routeId: route.id,
        vehicleId: vehicle.id,
        departureTime: t.time,
        arrivalTime: arrTime,
        priceUGX: t.price,
        availableSeats: vehicle.totalSeats - 2, // 2 demo booked seats
        status: TripStatus.SCHEDULED,
      },
    });
    createdTrips.push(trip);
  }

  console.log(`✅ Created ${createdTrips.length} scheduled bus trips.`);

  // 5. Create Demo Booking with Seats & Digital Ticket for Customer
  const firstTrip = createdTrips[0];
  const vehicleSeats = await prisma.seat.findMany({ where: { vehicleId: firstTrip.vehicleId }, take: 2 });

  if (vehicleSeats.length >= 2) {
    const bookingRef = 'MUST-8942-XJ';
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
              fullName: 'Ikayo Emmanuel',
              phone: '+256701234567',
              email: 'student@must.ac.ug',
            },
            {
              seatId: vehicleSeats[1].id,
              fullName: 'Atukwase Godson',
              phone: '+256779876543',
              email: 'godson@must.ac.ug',
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
            ticketCode: 'TKT-MUST-8942',
            qrData: JSON.stringify({ ref: bookingRef, passenger: 'Ikayo Emmanuel', route: 'Kampala -> Mbarara' }),
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
