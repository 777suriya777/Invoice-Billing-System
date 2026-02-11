import nodemailer from 'nodemailer';

export async function sendEmailService(clientEmail: string, invoiceId: number, pdfBuffer : Buffer) {
    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `Invoice Billing System <${process.env.EMAIL_USER}>`,
        to: clientEmail,
        subject: `Invoice ${invoiceId}`,
        text: 'Please find attached your invoice.',
        attachments: [
            {
                contentType: 'application/pdf',
                filename: `invoice-${invoiceId}.pdf`,
                content: pdfBuffer,
            },
        ],
    }

    return transport.sendMail(mailOptions);
}