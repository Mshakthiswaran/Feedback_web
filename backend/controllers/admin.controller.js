import prisma from '../config/db.js';

// GET /api/admin/professors — list all professors
export const getAllProfessors = async (req, res) => {
    try {
        const professors = await prisma.professor.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { forms: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(professors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/stats — system-wide stats
export const getAdminStats = async (req, res) => {
    try {
        const [totalProfessors, totalForms, totalSubmissions, activeForms] = await Promise.all([
            prisma.professor.count(),
            prisma.feedbackForm.count(),
            prisma.submission.count(),
            prisma.feedbackForm.count({ where: { isActive: true } }),
        ]);

        res.json({ totalProfessors, totalForms, totalSubmissions, activeForms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/professors/:id — remove a professor
export const removeProfessor = async (req, res) => {
    try {
        const prof = await prisma.professor.findUnique({ where: { id: req.params.id } });
        if (!prof) return res.status(404).json({ message: 'Professor not found' });
        if (prof.role === 'admin') return res.status(400).json({ message: 'Cannot remove admin' });

        await prisma.professor.delete({ where: { id: req.params.id } });
        res.json({ message: 'Professor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/forms — all forms across system
export const getAllForms = async (req, res) => {
    try {
        const forms = await prisma.feedbackForm.findMany({
            include: {
                professor: { select: { name: true, email: true } },
                _count: { select: { submissions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
