import PDFDocument from 'pdfkit';

export function generateInvoicePDF(invoice: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffer: Uint8Array[] = [];

        doc.on('data', buffer.push.bind(buffer));
        doc.on('end', () => {
            resolve(Buffer.concat(buffer));
        });
        doc.on('error', (err) => {
            reject(err);
        });

        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('INVOICE', { align: 'right' })
            .fontSize(10)
            .text(`Invoice Number: ${invoice.id || 'INV-001'}`, { align: 'right' })
            .moveDown();

        doc
            .fillColor('#000000')
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Bill To:', 50, 150)
            .font('Helvetica')
            .text(invoice.clientName)
            .text(invoice.clientAddress)
            .moveDown();

        const tableTop = 250;
        doc
            .font('Helvetica-Bold')
            .text('Item', 50, tableTop)
            .text('Quantity', 250, tableTop)
            .text('Price', 350, tableTop)
            .text('Total', 450, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let currentY = tableTop + 30;
        invoice.items.forEach((item: any) => {
            doc
                .font('Helvetica')
                .text(item.itemName, 50, currentY)
                .text(item.quantity.toString(), 250, currentY)
                .text(`$${item.unitPrice}`, 350, currentY)
                .text(`$${item.amount}`, 450, currentY);

            currentY += 20;
        });

        const totalY = currentY + 30;
        doc
            .font('Helvetica-Bold')
            .text('Total Amount Due:', 350, totalY)
            .fontSize(14)
            .text(`$${invoice.totalAmount}`, 480, totalY);

        doc.end();
    })
}
