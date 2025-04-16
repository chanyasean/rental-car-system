const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (booking, car, user) => {
  const doc = new PDFDocument();

    // Make sure the invoices folder exists
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

  const filePath = path.join(invoicesDir, `../invoices/invoice-${booking._id}.pdf`);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Rental Car Booking Invoice', { align: 'center' });
  doc.moveDown();

    // Format booking date
    const bookingDate = new Date(booking.bookingDate);

    // Format it in Thailand timezone
    const options = {
      timeZone: 'Asia/Bangkok',
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(bookingDate);
    
  doc.fontSize(14).text(`Booking ID: ${booking._id}`);
  doc.text(`Customer: ${user.name} (${user.email})`);
  doc.text(`Car: ${car.name}`);
  doc.text(`Provider: ${car.provider.name}`);
  doc.text(`Booking Date: ${formattedDate} (Thailand Time)`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.end();

  return filePath;
};

module.exports = generateInvoice;