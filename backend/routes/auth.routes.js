import express from 'express';
import { registerProfessor, authProfessor, getProfessorProfile, updateProfessorProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerProfessor);
router.post('/login', authProfessor);
router.get('/profile', protect, getProfessorProfile);
router.put('/profile', protect, updateProfessorProfile);

export default router;
