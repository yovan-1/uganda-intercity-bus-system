import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { ticketRouter, adminRouter } from './routes/ticketRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve vanilla HTML5, CSS3 & JavaScript frontend
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRouter);
app.use('/api/admin', adminRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Uganda Intercity Digital Coach Travel Reservation API',
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Uganda Bus Travel Backend running on http://localhost:${PORT}`);
});

