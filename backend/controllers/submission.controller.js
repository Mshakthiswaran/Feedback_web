import prisma from '../config/db.js';

// POST /api/submissions/:formId — Submit feedback (public)
export const submitFeedback = async (req, res) => {
    try {
        const { formId } = req.params;
        const { studentName, rollNumber, studentEmail, overallComment, answers } = req.body;

        if (!rollNumber) return res.status(400).json({ message: 'Roll number is required' });

        // Check form exists and is active
        const form = await prisma.feedbackForm.findUnique({
            where: { id: formId },
            include: { columns: true, rows: true },
        });
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (!form.isActive) return res.status(400).json({ message: 'This form is no longer accepting responses' });

        // Check for duplicate submission
        const existing = await prisma.submission.findUnique({
            where: { formId_rollNumber: { formId, rollNumber } },
        });
        if (existing) return res.status(400).json({ message: 'You have already submitted feedback for this form' });

        // Deduplicate answers to prevent database conflicts
        const uniqueAnswers = [];
        const seen = new Set();
        for (const a of answers || []) {
            const key = `${a.rowId}-${a.columnId}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueAnswers.push(a);
            }
        }

        const submission = await prisma.submission.create({
            data: {
                formId,
                studentName: studentName || null,
                rollNumber,
                studentEmail: studentEmail || null,
                overallComment: overallComment || null,
                answers: {
                    create: uniqueAnswers.map(a => ({
                        rowId: a.rowId,
                        columnId: a.columnId,
                        rating: a.rating,
                    })),
                },
            },
            include: { answers: true },
        });

        res.status(201).json({ message: 'Feedback submitted successfully', id: submission.id });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'You have already submitted feedback for this form' });
        }
        res.status(500).json({ message: error.message });
    }
};

// GET /api/submissions/:formId — Get all submissions (protected)
export const getFormSubmissions = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await prisma.feedbackForm.findUnique({ where: { id: formId } });
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (form.professorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await prisma.submission.findMany({
            where: { formId },
            include: { answers: true },
            orderBy: { submittedAt: 'desc' },
        });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/submissions/:formId/stats — Get aggregated stats (protected)
export const getSubmissionStats = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await prisma.feedbackForm.findUnique({
            where: { id: formId },
            include: {
                columns: { orderBy: { order: 'asc' } },
                rows: { where: { isHeader: false }, orderBy: { order: 'asc' } },
            },
        });
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (form.professorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const answers = await prisma.answer.findMany({
            where: { submission: { formId } },
        });

        const totalSubmissions = await prisma.submission.count({ where: { formId } });

        // Build averages map: { "rowId-columnId": { sum, count, avg } }
        const statsMap = {};
        for (const ans of answers) {
            const key = `${ans.rowId}-${ans.columnId}`;
            if (!statsMap[key]) statsMap[key] = { sum: 0, count: 0 };
            statsMap[key].sum += ans.rating;
            statsMap[key].count += 1;
        }

        // Calculate averages
        for (const key of Object.keys(statsMap)) {
            statsMap[key].avg = parseFloat((statsMap[key].sum / statsMap[key].count).toFixed(2));
        }

        // Column-level averages
        const columnAverages = {};
        for (const col of form.columns) {
            const colAnswers = answers.filter(a => a.columnId === col.id);
            const sum = colAnswers.reduce((s, a) => s + a.rating, 0);
            columnAverages[col.id] = colAnswers.length > 0 ? parseFloat((sum / colAnswers.length).toFixed(2)) : 0;
        }

        // Overall average
        const overallSum = answers.reduce((s, a) => s + a.rating, 0);
        const overallAvg = answers.length > 0 ? parseFloat((overallSum / answers.length).toFixed(2)) : 0;

        res.json({
            totalSubmissions,
            overallAverage: overallAvg,
            columnAverages,
            cellAverages: statsMap,
            columns: form.columns,
            rows: form.rows,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
