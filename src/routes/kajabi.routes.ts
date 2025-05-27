import { Router } from 'express';
import { getCourses, getOffers } from '../controllers/kajabi.controller';

const router = Router();

router.get('/offers', getOffers);

router.get('/courses', getCourses);

export default router;
