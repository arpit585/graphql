const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateBlankCarePlanTemplate(config = {}) {
  const {
    outputPath = 'care-plan-template.pdf',
    timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    patientInfo = {},
  } = config;

  if (!outputPath) {
    throw new Error('Output path is required');
  }

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(outputPath));

  const drawTableBorders = (xStart, xEnd, yStart, yEnd, middleX) => {
    doc.lineWidth(1)
       .moveTo(xStart, yStart).lineTo(xEnd, yStart).stroke()
       .moveTo(xStart, yEnd).lineTo(xEnd, yEnd).stroke()
       .moveTo(xStart, yStart).lineTo(xStart, yEnd).stroke()
       .moveTo(xEnd, yStart).lineTo(xEnd, yEnd).stroke();
    if (middleX) {
      doc.moveTo(middleX, yStart).lineTo(middleX, yEnd).stroke();
    }
  };

  doc.fontSize(20).font('Helvetica-Bold').text('Care Plan', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(10).font('Helvetica').text(`Generated on: ${timestamp}`, { align: 'right' });
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text('Patient Information');
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col1X = 50;
  const col2X = 300;

  doc.fontSize(12).font('Helvetica');
  doc.text('Patient name:', col1X, tableTop).text(patientInfo.name || '', col2X, tableTop);
  doc.text('Age:', col1X, tableTop + 20).text(patientInfo.age || '', col2X, tableTop + 20);
  doc.text('Gender:', col1X, tableTop + 40).text(patientInfo.gender || '', col2X, tableTop + 40);
  doc.text('Date of birth:', col1X, tableTop + 60).text(patientInfo.dob || '', col2X, tableTop + 60);
  doc.text('Medical history:', col1X, tableTop + 80).text(patientInfo.medicalHistory || '', col2X, tableTop + 80);

  drawTableBorders(40, 550, tableTop - 10, tableTop + 100);

  doc.moveDown(2);

  doc.fontSize(14).font('Helvetica-Bold').text('Assessment');
  doc.moveDown(0.5);

  const assessTop = doc.y;
  doc.fontSize(12).font('Helvetica');
  doc.text('Subjective', col1X, assessTop, { width: 245, align: 'center' });
  doc.text('Objective', col2X, assessTop, { width: 245, align: 'center' });

  doc.text(patientInfo.subjective || '', col1X, assessTop + 30, { width: 245 });
  doc.text(patientInfo.objective || '', col2X, assessTop + 30, { width: 245 });

  drawTableBorders(40, 550, assessTop - 10, assessTop + 80, 295);

  doc.moveDown(2);

  doc.fontSize(14).font('Helvetica-Bold').text('Nursing Diagnosis');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(patientInfo.nursingDiagnosis || '', { width: 500 });

  doc.end();
}

module.exports = generateBlankCarePlanTemplate;