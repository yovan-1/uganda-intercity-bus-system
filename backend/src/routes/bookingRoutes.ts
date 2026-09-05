import { Router } from 'express';
import { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings } from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getUserBookings);
router.get('/all', authenticate, authorize('ADMIN', 'STAFF'), getAllBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', authenticate, cancelBooking);

export default router;
