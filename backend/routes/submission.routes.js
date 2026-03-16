import express from 'express';
import { submitFeedback, getFormSubmissions, getSubmissionStats } from '../controllers/submission.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:formId', submitFeedback);                    // public
router.get('/:formId', protect, getFormSubmissions);        // protected
router.get('/:formId/stats', protect, getSubmissionStats);  // protected

export default router;
