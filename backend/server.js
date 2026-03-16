import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import formRoutes from './routes/form.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import exportRoutes from './routes/export.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));
app.get('/health', (req, res) => res.json({ status: 'ok', msg: 'API Running' }));

console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
app.use('/api/forms', (req, res, next) => {
    console.log(`Forms route hit: ${req.method} ${req.url}`);
    next();
}, formRoutes);
app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));
app.use('/api/submissions', submissionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
console.log('Routes mounted.');

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Server Error' });
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

export default app;
