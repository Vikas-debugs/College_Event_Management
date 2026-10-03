const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateCertificatePDF = async ({ certificateId, studentName, eventTitle, category, eventDate, department, profilePhoto }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, `${certificateId}.pdf`);
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 30, bottom: 30, left: 40, right: 40 },
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Background border and ornamental frame
      const width = doc.page.width;
      const height = doc.page.height;

      // Outer Deep Purple Border
      doc.rect(20, 20, width - 40, height - 40)
         .lineWidth(4)
         .stroke('#4c0c56');

      // Inner Gold Border
      doc.rect(26, 26, width - 52, height - 52)
         .lineWidth(1.5)
         .stroke('#d4a229');

      // Optional Participant Photo on Top Right
      if (profilePhoto) {
        try {
          let photoBuffer;
          if (typeof profilePhoto === 'string' && profilePhoto.startsWith('data:image')) {
            const base64Data = profilePhoto.split(',')[1];
            photoBuffer = Buffer.from(base64Data, 'base64');
          } else if (typeof profilePhoto === 'string' && fs.existsSync(profilePhoto)) {
            photoBuffer = fs.readFileSync(profilePhoto);
          }
          if (photoBuffer) {
            const photoX = width - 130;
            const photoY = 44;
            const photoW = 75;
            const photoH = 90;

            // Border for Photo
            doc.rect(photoX - 2, photoY - 2, photoW + 4, photoH + 4)
               .lineWidth(1.5)
               .stroke('#d4a229');

            doc.image(photoBuffer, photoX, photoY, {
              fit: [photoW, photoH],
              align: 'center',
              valign: 'center',
            });

            doc.fillColor('#6b5a72')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text('PARTICIPANT', photoX - 5, photoY + photoH + 4, { width: photoW + 10, align: 'center' });
          }
        } catch (photoErr) {
          console.warn('[PDFService] Could not embed participant profile photo:', photoErr.message);
        }
      }

      // Header Brand
      doc.fillColor('#4c0c56')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('TECHNO INSTITUTE OF HIGHER STUDIES', 0, 50, { align: 'center' });

      doc.fillColor('#e29826')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('NAAC ACCREDITED | NCTE APPROVED | ISO 9001:2015 | AFFILIATED TO UNIVERSITY OF LUCKNOW', 0, 80, { align: 'center' });

      doc.fillColor('#6b5a72')
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text('"Shaping Future Skilled Professionals" — Lucknow, Uttar Pradesh', 0, 96, { align: 'center' });

      // Title
      doc.fillColor('#4c0c56')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF PARTICIPATION', 0, 130, { align: 'center' });

      doc.strokeColor('#d4a229')
         .lineWidth(2)
         .moveTo(width / 2 - 150, 165)
         .lineTo(width / 2 + 150, 165)
         .stroke();

      // Body text
      doc.fillColor('#2d1535')
         .fontSize(14)
         .font('Helvetica')
         .text('This is proudly presented to', 0, 185, { align: 'center' });

      // Student Name
      doc.fillColor('#4c0c56')
         .fontSize(26)
         .font('Helvetica-Bold')
         .text(studentName.toUpperCase(), 0, 210, { align: 'center' });

      // Department & Event details
      const formattedDate = new Date(eventDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const bodyParagraph = `from Department of ${department || 'General Studies'} for active participation and commendable performance in the ${category} event "${eventTitle}" held on ${formattedDate} at TIHS Campus, Lucknow.`;

      doc.fillColor('#2d1535')
         .fontSize(13)
         .font('Helvetica')
         .text(bodyParagraph, 100, 255, {
           width: width - 200,
           align: 'center',
           lineGap: 4,
         });

      // Verification QR Code
      const verifyUrl = `https://tihs.edu.in/verify-cert/${certificateId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 70, height - 145, { fit: [75, 75] });

      doc.fillColor('#6b5a72')
         .fontSize(8)
         .font('Helvetica')
         .text(`Certificate ID: ${certificateId}`, 55, height - 60, { width: 110, align: 'center' });

      // Signatures
      doc.fillColor('#2d1535')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Dr. S. K. Singh', width - 240, height - 100, { align: 'center', width: 180 });
      
      doc.fillColor('#6b5a72')
         .fontSize(10)
         .font('Helvetica')
         .text('Director / Principal, TIHS', width - 240, height - 85, { align: 'center', width: 180 });

      doc.strokeColor('#2d1535')
         .lineWidth(1)
         .moveTo(width - 220, height - 105)
         .lineTo(width - 80, height - 105)
         .stroke();

      // Convener signature
      doc.fillColor('#2d1535')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Event Convener', width / 2 - 90, height - 100, { align: 'center', width: 180 });

      doc.fillColor('#6b5a72')
         .fontSize(10)
         .font('Helvetica')
         .text('Faculty Coordinator, TIHS', width / 2 - 90, height - 85, { align: 'center', width: 180 });

      doc.strokeColor('#2d1535')
         .lineWidth(1)
         .moveTo(width / 2 - 70, height - 105)
         .lineTo(width / 2 + 70, height - 105)
         .stroke();

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          filePath,
          relativeUrl: `/uploads/certificates/${certificateId}.pdf`,
          certificateId,
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateCertificatePDF,
};
