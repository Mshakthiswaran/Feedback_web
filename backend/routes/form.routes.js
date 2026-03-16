import express from 'express';
import { createForm, getMyForms, getFormById, updateForm, deleteForm, toggleFormActive } from '../controllers/form.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createForm);
router.get('/', protect, getMyForms);
router.get('/:id', getFormById);        // public — students access this
router.put('/:id', protect, updateForm);
router.delete('/:id', protect, deleteForm);
router.patch('/:id/toggle', protect, toggleFormActive);

export default router;
