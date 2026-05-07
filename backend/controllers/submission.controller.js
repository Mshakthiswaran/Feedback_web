import prisma from '../config/db.js';

// POST /api/submissions/:formId — Submit feedback (public)
export const submitFeedback = async (req, res) => {
    try {
        const { formId } = req.params;
        const { studentName, rollNumber, studentEmail, overallComment, answers, questionResponses } = req.body;

        if (!rollNumber) return res.status(400).json({ message: 'Roll number is required' });

        // Check form exists and is active
        const form = await prisma.feedbackForm.findUnique({
            where: { id: formId },
            include: { columns: true, rows: true, questions: true },
        });
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (!form.isActive) return res.status(400).json({ message: 'This form is no longer accepting responses' });

        // Check maxResponses limit
        if (form.maxResponses) {
            const count = await prisma.submission.count({ where: { formId } });
            if (count >= form.maxResponses) {
                return res.status(400).json({ message: `This form has reached its maximum of ${form.maxResponses} responses and is now closed.` });
            }
        }

        // Check for duplicate submission
        const existing = await prisma.submission.findUnique({
            where: { formId_rollNumber: { formId, rollNumber } },
        });
        if (existing) return res.status(400).json({ message: 'You have already submitted feedback for this form' });

        // Deduplicate matrix answers
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
                answers: uniqueAnswers.length ? {
                    create: uniqueAnswers.map(a => ({
                        rowId: a.rowId,
                        columnId: a.columnId,
                        rating: a.rating,
                    })),
                } : undefined,
                questionResponses: questionResponses?.length ? {
                    create: questionResponses.map(qr => ({
                        questionId: qr.questionId,
                        textValue: qr.textValue || null,
                        selectedOpts: JSON.stringify(qr.selectedOpts || []),
                    })),
                } : undefined,
            },
            include: { answers: true, questionResponses: true },
        });

        // Auto-close form if maxResponses just reached
        if (form.maxResponses) {
            const count = await prisma.submission.count({ where: { formId } });
            if (count >= form.maxResponses) {
                await prisma.feedbackForm.update({
                    where: { id: formId },
                    data: { isActive: false },
                });
            }
        }

        res.status(201).json({
            message: 'Feedback submitted successfully',
            id: submission.id,
            confirmationMessage: form.confirmationMessage || null,
        });
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
            include: {
                answers: true,
                questionResponses: {
                    include: { question: true },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });

        submissions.forEach(s => {
            if (s.questionResponses) s.questionResponses = s.questionResponses.map(qr => ({...qr, selectedOpts: JSON.parse(qr.selectedOpts || '[]')}));
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
                questions: { orderBy: { order: 'asc' } },
            },
        });
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (form.questions) form.questions = form.questions.map(q => ({...q, options: JSON.parse(q.options || '[]')}));
        if (form.professorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const answers = await prisma.answer.findMany({
            where: { submission: { formId } },
        });

        const totalSubmissions = await prisma.submission.count({ where: { formId } });

        // Matrix cell averages
        const statsMap = {};
        for (const ans of answers) {
            const key = `${ans.rowId}-${ans.columnId}`;
            if (!statsMap[key]) statsMap[key] = { sum: 0, count: 0 };
            statsMap[key].sum += ans.rating;
            statsMap[key].count += 1;
        }
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

        // Overall average (matrix)
        const overallSum = answers.reduce((s, a) => s + a.rating, 0);
        const overallAvg = answers.length > 0 ? parseFloat((overallSum / answers.length).toFixed(2)) : 0;

        // Question response stats
        const questionStats = {};
        if (form.questions.length > 0) {
            const qResponses = await prisma.questionResponse.findMany({
                where: { submission: { formId } },
                include: { question: true },
            });
            qResponses.forEach(qr => { qr.selectedOpts = JSON.parse(qr.selectedOpts || '[]'); });

            for (const q of form.questions) {
                const qr = qResponses.filter(r => r.questionId === q.id);
                if (q.type === 'short_answer' || q.type === 'paragraph' || q.type === 'date') {
                    questionStats[q.id] = {
                        type: q.type,
                        label: q.label,
                        textAnswers: qr.map(r => r.textValue).filter(Boolean),
                    };
                } else if (['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type)) {
                    const counts = {};
                    for (const opt of (q.options || [])) counts[opt] = 0;
                    for (const r of qr) {
                        for (const opt of (r.selectedOpts || [])) {
                            counts[opt] = (counts[opt] || 0) + 1;
                        }
                    }
                    questionStats[q.id] = { type: q.type, label: q.label, optionCounts: counts };
                } else if (q.type === 'linear_scale' || q.type === 'star_rating') {
                    const vals = qr.map(r => parseFloat(r.textValue)).filter(v => !isNaN(v));
                    const avg = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
                    questionStats[q.id] = { type: q.type, label: q.label, average: avg, responses: vals };
                }
            }
        }

        res.json({
            totalSubmissions,
            overallAverage: overallAvg,
            columnAverages,
            cellAverages: statsMap,
            columns: form.columns,
            rows: form.rows,
            questions: form.questions,
            questionStats,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
