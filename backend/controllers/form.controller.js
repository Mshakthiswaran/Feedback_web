import prisma from '../config/db.js';

// POST /api/forms — Create a new feedback form (matrix or custom)
export const createForm = async (req, res) => {
    try {
        const {
            title, courseName, subjectCode, semester, academicYear,
            deadline, isActive, isAnonymous, pinProtected, pin,
            columns, rows, questions,
            confirmationMessage, maxResponses, themeColor
        } = req.body;

        const form = await prisma.feedbackForm.create({
            data: {
                professorId: req.user.id,
                title,
                courseName: courseName || '',
                subjectCode: subjectCode || '',
                semester: semester || '',
                academicYear: academicYear || '',
                deadline: new Date(deadline),
                isActive: isActive ?? true,
                isAnonymous: isAnonymous ?? true,
                pinProtected: pinProtected ?? false,
                pin: pin || null,
                confirmationMessage: confirmationMessage || null,
                maxResponses: maxResponses ? parseInt(maxResponses) : null,
                themeColor: themeColor || null,
                columns: columns?.length ? {
                    create: columns.map((col, i) => ({
                        subjectName: col.name,
                        order: i,
                    })),
                } : undefined,
                rows: rows?.length ? {
                    create: rows.map((row, i) => ({
                        label: row.label,
                        isHeader: row.isHeader || false,
                        sectionGroup: row.sectionGroup || null,
                        order: i,
                    })),
                } : undefined,
                questions: questions?.length ? {
                    create: questions.map((q, i) => ({
                        type: q.type,
                        label: q.label,
                        options: JSON.stringify(q.options || []),
                        required: q.required || false,
                        scaleMin: q.scaleMin ?? null,
                        scaleMax: q.scaleMax ?? null,
                        order: i,
                    })),
                } : undefined,
            },
            include: { columns: true, rows: true, questions: { orderBy: { order: 'asc' } } },
        });

        if (form.questions) form.questions = form.questions.map(q => ({...q, options: JSON.parse(q.options || '[]')}));
        res.status(201).json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/forms — Get all forms for the logged-in professor
export const getMyForms = async (req, res) => {
    try {
        const forms = await prisma.feedbackForm.findMany({
            where: { professorId: req.user.id },
            include: {
                columns: { orderBy: { order: 'asc' } },
                rows: { orderBy: { order: 'asc' } },
                questions: { orderBy: { order: 'asc' } },
                _count: { select: { submissions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        forms.forEach(f => { if (f.questions) f.questions = f.questions.map(q => ({...q, options: JSON.parse(q.options || '[]')})); });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/forms/:id — Get a single form (public for students)
export const getFormById = async (req, res) => {
    try {
        const form = await prisma.feedbackForm.findUnique({
            where: { id: req.params.id },
            include: {
                columns: { orderBy: { order: 'asc' } },
                rows: { orderBy: { order: 'asc' } },
                questions: { orderBy: { order: 'asc' } },
                professor: { select: { name: true } },
            },
        });

        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (form.questions) form.questions = form.questions.map(q => ({...q, options: JSON.parse(q.options || '[]')}));
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/forms/:id — Update a form
export const updateForm = async (req, res) => {
    try {
        const {
            title, courseName, subjectCode, semester, academicYear,
            deadline, isActive, isAnonymous, pinProtected, pin,
            columns, rows, questions,
            confirmationMessage, maxResponses, themeColor
        } = req.body;

        const existing = await prisma.feedbackForm.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ message: 'Form not found' });
        if (existing.professorId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        // Delete old columns, rows, questions then recreate
        await prisma.formColumn.deleteMany({ where: { formId: req.params.id } });
        await prisma.formRow.deleteMany({ where: { formId: req.params.id } });
        await prisma.question.deleteMany({ where: { formId: req.params.id } });

        const form = await prisma.feedbackForm.update({
            where: { id: req.params.id },
            data: {
                title, courseName, subjectCode: subjectCode || '', semester, academicYear,
                deadline: new Date(deadline),
                isActive: isActive ?? true,
                isAnonymous: isAnonymous ?? true,
                pinProtected: pinProtected ?? false,
                pin: pin || null,
                confirmationMessage: confirmationMessage || null,
                maxResponses: maxResponses ? parseInt(maxResponses) : null,
                themeColor: themeColor || null,
                columns: columns?.length ? {
                    create: columns.map((col, i) => ({ subjectName: col.name, order: i })),
                } : undefined,
                rows: rows?.length ? {
                    create: rows.map((row, i) => ({ label: row.label, isHeader: row.isHeader || false, sectionGroup: row.sectionGroup || null, order: i })),
                } : undefined,
                questions: questions?.length ? {
                    create: questions.map((q, i) => ({
                        type: q.type,
                        label: q.label,
                        options: JSON.stringify(q.options || []),
                        required: q.required || false,
                        scaleMin: q.scaleMin ?? null,
                        scaleMax: q.scaleMax ?? null,
                        order: i,
                    })),
                } : undefined,
            },
            include: { columns: true, rows: true, questions: { orderBy: { order: 'asc' } } },
        });

        if (form.questions) form.questions = form.questions.map(q => ({...q, options: JSON.parse(q.options || '[]')}));
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/forms/:id
export const deleteForm = async (req, res) => {
    try {
        const existing = await prisma.feedbackForm.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ message: 'Form not found' });
        if (existing.professorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.feedbackForm.delete({ where: { id: req.params.id } });
        res.json({ message: 'Form deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/forms/:id/toggle — Toggle form active status
export const toggleFormActive = async (req, res) => {
    try {
        const existing = await prisma.feedbackForm.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ message: 'Form not found' });
        if (existing.professorId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const form = await prisma.feedbackForm.update({
            where: { id: req.params.id },
            data: { isActive: !existing.isActive },
        });

        res.json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
