import { Router } from 'express';
import { getVehicles, createVehicle, updateVehicleStatus } from '../controllers/vehicleController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getVehicles);
router.post('/', authenticate, authorize('ADMIN'), createVehicle);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateVehicleStatus);

export default router;
