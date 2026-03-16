import prisma from '../config/db.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// GET /api/export/:formId/pdf
export const exportPDF = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await prisma.feedbackForm.findUnique({
            where: { id: formId },
            include: {
                columns: { orderBy: { order: 'asc' } },
                rows: { orderBy: { order: 'asc' } },
                professor: { select: { name: true } },
            },
        });
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const submissions = await prisma.submission.findMany({
            where: { formId },
            include: { answers: true },
        });

        // Calculate averages
        const answers = submissions.flatMap(s => s.answers);
        const statsMap = {};
        for (const ans of answers) {
            const key = `${ans.rowId}-${ans.columnId}`;
            if (!statsMap[key]) statsMap[key] = { sum: 0, count: 0 };
            statsMap[key].sum += ans.rating;
            statsMap[key].count += 1;
        }

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${form.title.replace(/\s+/g, '_')}_report.pdf"`);
        doc.pipe(res);

        // Title
        doc.fontSize(18).font('Helvetica-Bold').text(form.title, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
            .text(`Course: ${form.courseName}  |  Semester: ${form.semester}  |  Year: ${form.academicYear}`, { align: 'center' });
        doc.text(`Professor: ${form.professor.name}  |  Total Responses: ${submissions.length}`, { align: 'center' });
        doc.moveDown(1);

        // Table
        const criteriaRows = form.rows.filter(r => !r.isHeader);
        const colWidth = 80;
        const labelWidth = 250;
        const startX = 40;
        let y = doc.y;

        // Header row
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Criteria', startX, y, { width: labelWidth });
        form.columns.forEach((col, i) => {
            doc.text(col.subjectName.substring(0, 15), startX + labelWidth + i * colWidth, y, { width: colWidth, align: 'center' });
        });
        y += 20;
        doc.moveTo(startX, y).lineTo(startX + labelWidth + form.columns.length * colWidth, y).stroke();
        y += 5;

        // Data rows
        doc.font('Helvetica').fontSize(8);
        for (const row of form.rows) {
            if (row.isHeader) {
                doc.font('Helvetica-Bold').fontSize(9);
                doc.text(row.label, startX, y, { width: labelWidth + form.columns.length * colWidth });
                doc.font('Helvetica').fontSize(8);
                y += 18;
            } else {
                doc.text(row.label, startX, y, { width: labelWidth });
                form.columns.forEach((col, i) => {
                    const key = `${row.id}-${col.id}`;
                    const avg = statsMap[key] ? (statsMap[key].sum / statsMap[key].count).toFixed(1) : '-';
                    doc.text(avg, startX + labelWidth + i * colWidth, y, { width: colWidth, align: 'center' });
                });
                y += 16;
            }

            if (y > 750) {
                doc.addPage();
                y = 40;
            }
        }

        // Individual Responses Table
        if (submissions.length > 0) {
            doc.addPage();
            doc.fontSize(14).font('Helvetica-Bold').text('Individual Responses', { align: 'center' });
            doc.moveDown(1);
            
            doc.fontSize(8);
            
            const cellPad = 5;
            const headers = ['Student Name', 'Student ID', 'Date', 'Comment'];
            const widths = [120, 80, 80, 220]; // Total 500
            
            let currentY = doc.y;
            
            // Draw Table Header
            doc.font('Helvetica-Bold');
            let currentX = startX;
            headers.forEach((header, i) => {
                doc.text(header, currentX, currentY, { width: widths[i], align: 'left' });
                currentX += widths[i];
            });
            currentY += 15;
            doc.moveTo(startX, currentY).lineTo(startX + 500, currentY).stroke();
            currentY += 5;
            
            // Draw Table Rows
            doc.font('Helvetica');
            for (const sub of submissions) {
                // Check page break
                if (currentY > 750) {
                    doc.addPage();
                    currentY = 40;
                    
                    doc.font('Helvetica-Bold');
                    let tempX = startX;
                    headers.forEach((header, i) => {
                        doc.text(header, tempX, currentY, { width: widths[i], align: 'left' });
                        tempX += widths[i];
                    });
                    currentY += 15;
                    doc.moveTo(startX, currentY).lineTo(startX + 500, currentY).stroke();
                    currentY += 5;
                    doc.font('Helvetica');
                }
                
                const name = sub.studentName || 'Anonymous';
                const id = sub.rollNumber;
                const date = sub.submittedAt.toISOString().split('T')[0];
                const comment = sub.overallComment || '';
                
                let tempX = startX;
                doc.text(name, tempX, currentY, { width: widths[0] - cellPad, align: 'left' });
                tempX += widths[0];
                
                doc.text(id, tempX, currentY, { width: widths[1] - cellPad, align: 'left' });
                tempX += widths[1];
                
                doc.text(date, tempX, currentY, { width: widths[2] - cellPad, align: 'left' });
                tempX += widths[2];
                
                doc.text(comment, tempX, currentY, { width: widths[3] - cellPad, align: 'left' });
                
                // Calculate height based on comment text wrapping
                const commentHeight = doc.heightOfString(comment, { width: widths[3] - cellPad });
                currentY += Math.max(15, commentHeight + 5);
            }
        }

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/export/:formId/excel
export const exportExcel = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await prisma.feedbackForm.findUnique({
            where: { id: formId },
            include: {
                columns: { orderBy: { order: 'asc' } },
                rows: { orderBy: { order: 'asc' } },
            },
        });
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const submissions = await prisma.submission.findMany({
            where: { formId },
            include: { answers: true },
        });

        const answers = submissions.flatMap(s => s.answers);
        const statsMap = {};
        for (const ans of answers) {
            const key = `${ans.rowId}-${ans.columnId}`;
            if (!statsMap[key]) statsMap[key] = { sum: 0, count: 0 };
            statsMap[key].sum += ans.rating;
            statsMap[key].count += 1;
        }

        const workbook = new ExcelJS.Workbook();

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        const headerRow = ['Criteria', ...form.columns.map(c => c.subjectName)];
        summarySheet.addRow(headerRow);
        summarySheet.getRow(1).font = { bold: true };

        for (const row of form.rows) {
            if (row.isHeader) {
                const r = summarySheet.addRow([row.label]);
                r.font = { bold: true };
            } else {
                const rowData = [row.label];
                form.columns.forEach(col => {
                    const key = `${row.id}-${col.id}`;
                    const avg = statsMap[key] ? parseFloat((statsMap[key].sum / statsMap[key].count).toFixed(2)) : '';
                    rowData.push(avg);
                });
                summarySheet.addRow(rowData);
            }
        }

        // Adjust column widths
        summarySheet.columns.forEach((col, i) => {
            col.width = i === 0 ? 45 : 20;
        });

        // Individual responses sheet
        const responsesSheet = workbook.addWorksheet('Individual Responses');
        const respHeader = ['Student Name', 'Student ID', 'Submitted At', 'Overall Comment'];
        responsesSheet.addRow(respHeader);
        responsesSheet.getRow(1).font = { bold: true };

        for (const sub of submissions) {
            responsesSheet.addRow([
                sub.studentName || 'Anonymous',
                sub.rollNumber,
                sub.submittedAt.toISOString().split('T')[0],
                sub.overallComment || '',
            ]);
        }

        responsesSheet.columns.forEach((col, i) => {
            col.width = [25, 15, 15, 40][i] || 15;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${form.title.replace(/\s+/g, '_')}_report.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
