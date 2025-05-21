const fetch = require('node-fetch');
const PDFDocument = require("pdfkit");
const fs = require("fs");
require('dotenv').config();
const now = new Date();
const api_url = process.env.api_url;

const query = `
  query {
    patientByName(name: "Alex") {
      name
      carePlans {
        title
        description
        goals
        careTeam {
          id
          name
          role
        }
      }
    }
  }
`;

function fetchCarePlans() {
  return fetch(api_url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      return data.data.patientByName; 
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      return null; 
    });
}

function generateHeader(doc) {
  doc.image('./images/exl.png', 72, 36, { width: 40 }) 
    .fillColor('#003087') 
    .fontSize(10)
    .fillColor('#666666') 
    .text('123 Main Street', 0, 36, { align: 'right' })
    .text('New York, NY, 10025', 0, 48, { align: 'right' })
    .moveDown();
}

function pdfgeneration(patient) {
  const doc = new PDFDocument({ margins: { top: 72, bottom: 72, left: 72, right: 72 } }); 
  generateHeader(doc);
  doc.pipe(fs.createWriteStream("Output/Care-plan-dummy-template.pdf"));

  // Title
  doc.fillColor('#008000') // Green color
    .fontSize(24)
    .font('Helvetica-Bold')
    .text("Care Plan Report", { align: 'center' });
  doc.moveTo(72, 120) 
    .lineTo(540, 120) 
    .lineWidth(1)
    .strokeColor('#008000')
    .stroke();
  doc.moveDown(1.5); 

  if (!patient || !patient.carePlans) {
    doc.fillColor("red")
      .fontSize(18)
      .text("No care plans available.", { align: 'center' });
    doc.end();
    return;
  }

  patient.carePlans.forEach(plan => {
    doc.fillColor("black")
      .fontSize(12)
      .font('Helvetica-Bold')
      .text("Patient: ", 72, doc.y, { continued: true }) 
      .font('Helvetica')
      .text(`${patient.name}`)
      .font('Helvetica-Bold')
      .text("Care Plan Title: ", 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(`${plan.title}`)
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text("Description: ")
      .font('Helvetica')
      .text(`${plan.description || "N/A"}`, 82, doc.y, { indent: 10 }) 
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text("Goals: ")
      .font('Helvetica')
      .text(`${plan.goals ? plan.goals.join(", ") : "N/A"}`, 82, doc.y, { indent: 10 })
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text("Care Team: ");
    
    plan.careTeam.forEach(member => {
      doc.text(`- ${member.name} (${member.role})`, 87, doc.y, { indent: 15 }); 
    });
    doc.moveDown(1.5); 
  });

  // Footer
  doc.fillColor('#666666')
    .fontSize(8)
    .text(`Generated on ${now.toLocaleDateString()}`, 0, doc.page.height - 72, { align: 'right' });

  doc.end();
}

fetchCarePlans().then(patient => {
  pdfgeneration(patient);
});