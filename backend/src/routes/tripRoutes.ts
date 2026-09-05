import { Router } from 'express';
import { getRoutes, searchTrips, getTripById, createTrip, deleteTrip } from '../controllers/tripController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/routes', getRoutes);
router.get('/', searchTrips);
router.get('/:id', getTripById);
router.post('/', authenticate, authorize('ADMIN'), createTrip);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTrip);

export default router;
