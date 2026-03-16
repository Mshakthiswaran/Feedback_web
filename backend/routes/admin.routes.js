import express from 'express';
import { getAllProfessors, getAdminStats, removeProfessor, getAllForms } from '../controllers/admin.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/professors', protect, admin, getAllProfessors);
router.get('/stats', protect, admin, getAdminStats);
router.delete('/professors/:id', protect, admin, removeProfessor);
router.get('/forms', protect, admin, getAllForms);

export default router;
