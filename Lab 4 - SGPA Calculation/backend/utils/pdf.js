const PDFDocument = require('pdfkit');

/**
 * Streams a nicely formatted result PDF directly to the HTTP response.
 */
function generateResultPDF(res, { student, subjects, sgpa, totalCredits, semesterLabel }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="VIT_Result_${(student.name || 'student').replace(/\s+/g, '_')}.pdf"`
  );

  doc.pipe(res);

  // Header
  doc
    .fillColor('#7A0C2E')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('VIT Semester Result', { align: 'center' });

  doc
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica')
    .text('(Unofficial result generated via the VIT SGPA Calculator app)', { align: 'center' });

  doc.moveDown(1.2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#7A0C2E').lineWidth(1).stroke();
  doc.moveDown(0.8);

  // Student info
  doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('Student Name: ', { continued: true });
  doc.font('Helvetica').text(student.name || '-');

  doc.font('Helvetica-Bold').text('Registration Number: ', { continued: true });
  doc.font('Helvetica').text(student.regNumber || '-');

  doc.font('Helvetica-Bold').text('Email: ', { continued: true });
  doc.font('Helvetica').text(student.email || '-');

  doc.font('Helvetica-Bold').text('Semester: ', { continued: true });
  doc.font('Helvetica').text(semesterLabel || 'Semester');

  doc.font('Helvetica-Bold').text('Generated On: ', { continued: true });
  doc.font('Helvetica').text(new Date().toLocaleString());

  doc.moveDown(1);

  // Table header
  const tableTop = doc.y;
  const colX = { subject: 50, credits: 220, mse: 280, ese: 340, final: 400, grade: 470 };

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
  doc.rect(50, tableTop, 495, 22).fill('#7A0C2E');
  doc.fillColor('#ffffff');
  doc.text('Subject', colX.subject + 5, tableTop + 6);
  doc.text('Credits', colX.credits, tableTop + 6);
  doc.text('MSE', colX.mse, tableTop + 6);
  doc.text('ESE', colX.ese, tableTop + 6);
  doc.text('Final', colX.final, tableTop + 6);
  doc.text('Grade', colX.grade, tableTop + 6);

  let rowY = tableTop + 22;
  doc.font('Helvetica').fontSize(10).fillColor('#000000');

  subjects.forEach((s, idx) => {
    const bg = idx % 2 === 0 ? '#F7EEF0' : '#FFFFFF';
    doc.rect(50, rowY, 495, 20).fill(bg);
    doc.fillColor('#000000');
    doc.text(s.name, colX.subject + 5, rowY + 5, { width: 160 });
    doc.text(String(s.credits), colX.credits, rowY + 5);
    doc.text(String(s.mse), colX.mse, rowY + 5);
    doc.text(String(s.ese), colX.ese, rowY + 5);
    doc.text(String(s.finalMarks), colX.final, rowY + 5);
    doc.text(`${s.grade} (${s.gradePoint})`, colX.grade, rowY + 5);
    rowY += 20;
  });

  doc.rect(50, rowY, 495, 1).fill('#7A0C2E');
  rowY += 10;

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
  doc.text(`Total Credits: ${totalCredits}`, 50, rowY);
  rowY += 16;
  doc.fillColor('#7A0C2E').fontSize(14).text(`SGPA: ${sgpa}`, 50, rowY);

  doc.moveDown(2);
  doc
    .fillColor('#666666')
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text(
      'This is a system-generated document for personal record-keeping and does not represent an official transcript.',
      50,
      doc.y,
      { width: 495, align: 'center' }
    );

  doc.end();
}

module.exports = { generateResultPDF };
