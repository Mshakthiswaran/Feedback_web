import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../config/jwt.js';

export const registerProfessor = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await prisma.professor.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isFirstAccount = (await prisma.professor.count()) === 0;
        const role = isFirstAccount ? 'admin' : 'professor';

        const user = await prisma.professor.create({
            data: { name, email, password: hashedPassword, role },
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const authProfessor = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.professor.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfessorProfile = async (req, res) => {
    try {
        const user = await prisma.professor.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, department: true, designation: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfessorProfile = async (req, res) => {
    const { name, department, designation } = req.body;

    try {
        const user = await prisma.professor.update({
            where: { id: req.user.id },
            data: { name, department, designation },
            select: { id: true, name: true, email: true, role: true, department: true, designation: true }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
