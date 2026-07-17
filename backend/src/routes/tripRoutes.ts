import { Router } from 'express';
import { getTrips, createTrip, updateTrip } from '../controllers/tripController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getTrips);
router.post('/', createTrip);
router.put('/:id', updateTrip);

export default router;
