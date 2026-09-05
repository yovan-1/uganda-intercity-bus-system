import { Router } from 'express';
import { verifyTicket } from '../controllers/ticketController';
import { getAdminStats, getUsers, updateUserRole } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const ticketRouter = Router();
ticketRouter.post('/verify', authenticate, authorize('STAFF', 'ADMIN'), verifyTicket);

const adminRouter = Router();
adminRouter.get('/stats', authenticate, authorize('ADMIN'), getAdminStats);
adminRouter.get('/users', authenticate, authorize('ADMIN'), getUsers);
adminRouter.patch('/users/:id', authenticate, authorize('ADMIN'), updateUserRole);

export { ticketRouter, adminRouter };
