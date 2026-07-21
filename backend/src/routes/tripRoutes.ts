import { Router } from 'express';
import { 
  getTrips, 
  createTrip, 
  updateTrip, 
  getActiveTrip, 
  getTripById, 
  startTrip, 
  updateLocation, 
  completeTrip 
} from '../controllers/tripController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getTrips);
router.get('/active', getActiveTrip);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.put('/start', startTrip);
router.put('/update-location', updateLocation);
router.put('/complete', completeTrip);
router.put('/:id', updateTrip);

export default router;

