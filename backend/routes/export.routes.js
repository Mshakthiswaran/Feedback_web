import express from 'express';
import { exportPDF, exportExcel } from '../controllers/export.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:formId/pdf', protect, exportPDF);
router.get('/:formId/excel', protect, exportExcel);

export default router;
