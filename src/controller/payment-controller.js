import memoryStore from '../memory-store.js';
import { v4 as uuidv4 } from 'uuid';
import { _roundTwo } from '../utils/Math.js';

const allowedPaymentMethods = ['Card', 'Bank Transfer', 'UPI', 'Cash'];

function makePaymentForAnInvoice(req, res) {
    const invoiceId = req.params.id;
    const { amount, paymentMethod } = req.body;
    const userEmail = req.user && req.user.email;

    if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });
    
    const invoices = memoryStore.get('invoices') || [];
    const invoiceIndex = invoices.findIndex(inv => String(inv.id) === String(invoiceId));

    if (invoiceIndex === -1) return res.status(404).json({ message: 'Invoice not found' });

    if (invoices[invoiceIndex].email !== userEmail) {
        return res.status(403).json({ message: 'Forbidden: access denied' });
    }

    if (invoices[invoiceIndex].status === 'Paid') {
        return res.status(400).json({ message: 'Invoice is already paid' });
    }

    if(invoices[invoiceIndex].status === 'Cancelled' || invoices[invoiceIndex].status === 'Draft'){
        return res.status(400).json({ message: `Cannot make payment for an invoice with status '${invoices[invoiceIndex].status}'` });
    }

    if(paymentMethod && !allowedPaymentMethods.includes(paymentMethod)){
        return res.status(400).json({ message: `Invalid payment method. Allowed methods are: ${allowedPaymentMethods.join(', ')}` });
    }

    if (amount <= 0 || amount > invoices[invoiceIndex].outstandingAmount) {
        return res.status(400).json({ message: 'Invalid payment amount' });
    }

    let newOutstandingAmount = _roundTwo(invoices[invoiceIndex].outstandingAmount - amount);
    
    invoices[invoiceIndex].outstandingAmount = newOutstandingAmount;

    if(newOutstandingAmount === 0){
        invoices[invoiceIndex].status = 'Paid';
    }
    else{
        invoices[invoiceIndex].status = 'Partially Paid';
    }

    //Storing payment record
    invoices[invoiceIndex].payments = invoices[invoiceIndex].payments || [];
    const paymentInfo = {
        id: uuidv4(),
        amount: amount,
        paymentMethod: paymentMethod || 'Unknown',
        createdBy: userEmail,
        paymentDate: new Date().toISOString()
    };
    invoices[invoiceIndex].payments.push(paymentInfo);

    invoices[invoiceIndex].updatedAt = new Date().toISOString();
    memoryStore.set('invoices', invoices);

    return res.status(200).json({ message: 'Payment processed successfully', invoice: invoices[invoiceIndex] });
}

function getPaymentForAnInvoice(req, res) {
    const invoiceId = req.params.id;
    const userEmail = req.user && req.user.email;

    if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

    const invoices = memoryStore.get('invoices') || [];
    const invoice = invoices.find(inv => String(inv.id) === String(invoiceId));

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (invoice.email !== userEmail) {
        return res.status(403).json({ message: 'Forbidden: access denied' });
    }

    const paymentInfo = invoice.payments || [];

    return res.status(200).json({ paymentInfo });
}

export {
  makePaymentForAnInvoice,
  getPaymentForAnInvoice
};