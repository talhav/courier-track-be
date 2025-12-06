const PDFDocument = require('pdfkit');

/**
 * Generate a professional invoice PDF for a shipment
 * @param {Object} shipment - The shipment data
 * @returns {PDFDocument} - The PDF document stream
 */
function generateInvoicePDF(shipment) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  // Helper function to format dates
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Colors
  const primaryColor = '#2563eb';
  const textColor = '#1f2937';
  const lightGray = '#f3f4f6';

  // Header
  doc.fontSize(28)
    .fillColor(primaryColor)
    .text('SHIPMENT INVOICE', 50, 50);

  // Company Information
  doc.fontSize(10)
    .fillColor(textColor)
    .text('Courier Track System', 50, 100)
    .text('Logistics & Shipping Services', 50, 115)
    .text('support@couriertrack.com', 50, 130);

  // Invoice Details (Right side)
  const rightX = 340;
  doc.fontSize(9)
    .fillColor(textColor)
    .text('Invoice #:', rightX, 100)
    .fontSize(8)
    .text(shipment.consigneeNumber, rightX + 55, 100, { width: 150 })
    .fontSize(9)
    .text(`Date: ${formatDate(shipment.createdAt)}`, rightX, 115)
    .text(`Status: ${shipment.status.toUpperCase()}`, rightX, 130);

  // Divider Line
  doc.strokeColor(primaryColor)
    .lineWidth(2)
    .moveTo(50, 160)
    .lineTo(545, 160)
    .stroke();

  // Shipper & Consignee Information
  let yPos = 185;

  // Shipper Section
  doc.fontSize(12)
    .fillColor(primaryColor)
    .text('SHIPPER INFORMATION', 50, yPos);

  yPos += 20;
  doc.fontSize(10)
    .fillColor(textColor)
    .text(`Name: ${shipment.shipperName}`, 50, yPos)
    .text(`Phone: ${shipment.shipperPhone}`, 50, yPos + 15)
    .text(`Address: ${shipment.shipperAddress}`, 50, yPos + 30)
    .text(`City: ${shipment.shipperCity}, ${shipment.shipperPostal}`, 50, yPos + 45)
    .text(`Country: ${shipment.shipperCountry}`, 50, yPos + 60);

  // Consignee Section (Right side)
  doc.fontSize(12)
    .fillColor(primaryColor)
    .text('CONSIGNEE INFORMATION', 320, 185);

  yPos = 205;
  doc.fontSize(10)
    .fillColor(textColor)
    .text(`Company: ${shipment.consigneeCompanyName || 'N/A'}`, 320, yPos)
    .text(`Name: ${shipment.receiverName}`, 320, yPos + 15)
    .text(`Phone: ${shipment.receiverPhone}`, 320, yPos + 30)
    .text(`Email: ${shipment.receiverEmail}`, 320, yPos + 45)
    .text(`Address: ${shipment.receiverAddress}`, 320, yPos + 60)
    .text(`City: ${shipment.receiverCity}, ${shipment.receiverZip}`, 320, yPos + 75)
    .text(`Country: ${shipment.receiverCountry}`, 320, yPos + 90);

  // Shipment Details Section
  yPos = 320;
  doc.fontSize(12)
    .fillColor(primaryColor)
    .text('SHIPMENT DETAILS', 50, yPos);

  // Table Header
  yPos += 25;
  doc.rect(50, yPos, 495, 25)
    .fillAndStroke(lightGray, primaryColor);

  doc.fontSize(10)
    .fillColor(textColor)
    .text('Description', 60, yPos + 8)
    .text('Service', 250, yPos + 8)
    .text('Pieces', 380, yPos + 8)
    .text('Type', 460, yPos + 8);

  // Table Row
  yPos += 25;
  doc.rect(50, yPos, 495, 30)
    .stroke(primaryColor);

  doc.fontSize(9)
    .text(shipment.description || 'General Shipment', 60, yPos + 10, { width: 180 })
    .text(shipment.service, 250, yPos + 10)
    .text(shipment.pieces.toString(), 380, yPos + 10)
    .text(shipment.shipmentType, 460, yPos + 10);

  // Additional Details
  yPos += 50;
  doc.fontSize(10)
    .fillColor(textColor)
    .text(`Account Number: ${shipment.accountNo || 'N/A'}`, 50, yPos)
    .text(`Currency: ${shipment.currency}`, 50, yPos + 15)
    .text(`Fragile: ${shipment.fragile ? 'Yes' : 'No'}`, 50, yPos + 30);

  if (shipment.weight) {
    doc.text(`Weight: ${shipment.weight} kg`, 50, yPos + 45);
  }

  if (shipment.dimensions) {
    doc.text(`Dimensions: ${shipment.dimensions}`, 50, yPos + 60);
  }

  if (shipment.shipperReference) {
    doc.text(`Reference: ${shipment.shipperReference}`, 50, yPos + 75);
  }

  // Invoice Type (if applicable)
  if (shipment.invoiceType) {
    yPos += 100;
    doc.fontSize(11)
      .fillColor(primaryColor)
      .text('INVOICE TYPE', 50, yPos);

    doc.fontSize(10)
      .fillColor(textColor)
      .text(shipment.invoiceType, 50, yPos + 20);
  }

  // Comments Section
  if (shipment.comments) {
    yPos += 40;
    doc.fontSize(11)
      .fillColor(primaryColor)
      .text('NOTES', 50, yPos);

    doc.fontSize(9)
      .fillColor(textColor)
      .text(shipment.comments, 50, yPos + 20, {
        width: 495,
        align: 'left'
      });
  }

  // Footer
  const footerY = 720;
  doc.strokeColor(primaryColor)
    .lineWidth(1)
    .moveTo(50, footerY)
    .lineTo(545, footerY)
    .stroke();

  doc.fontSize(8)
    .fillColor(textColor)
    .text('Thank you for choosing Courier Track!', 50, footerY + 10)
    .text('For inquiries, please contact: support@couriertrack.com | +1 (555) 123-4567', 50, footerY + 25, {
      align: 'center',
      width: 495
    });

  doc.fontSize(7)
    .fillColor('#6b7280')
    .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 45, {
      align: 'center',
      width: 495
    });

  // Finalize the PDF
  doc.end();

  return doc;
}

module.exports = { generateInvoicePDF };
