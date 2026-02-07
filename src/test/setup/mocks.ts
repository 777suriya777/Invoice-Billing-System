/**
 * Shared Mock Data and Configurations
 * These are reusable across all test files
 * Variable names prefixed with 'mock' are allowed in jest.mock() declarations
 */

// Auth Middleware Mock
export const mockAuthMiddlewareData = {
  __esModule: true,
  default: (req: any, res: any, next: any) => {
    req.user = { 
      id: '1', 
      email: 'suriyaprasath918@gmail.com',
      firstName: 'Test',
      lastName: 'User'
    };
    next();
  }
};

// Invoice Repository Mock Data
export const mockInvoiceRepositoryData = {
  __esModule: true,
  getInvoicesByUserFromRepo: (): any => Promise.resolve([
    { id: '1', clientName: 'Test Client', totalAmount: 1000 }
  ]),
  getInvoiceByIdFromRepo: (): any => Promise.resolve({
    id: '1',
    clientName: 'Test Client',
    totalAmount: 1000,
    items: []
  }),
  createInvoiceInRepo: (): any => Promise.resolve({
    id: '1',
    clientName: 'Test Client',
    clientAddress: 'Test Address',
    invoiceDate: '2026-01-01',
    dueDate: '2026-01-10',
    totalAmount: 200,
    items: [
      {
        itemName: 'Service',
        description: 'Consulting',
        quantity: 2,
        unitPrice: 100
      }
    ]
  }),
  updateInvoiceStatusInRepo: (): any => Promise.resolve({
    id: '1',
    status: 'Paid'
  })
};

// Payment Repository Mock Data
// Note: createPaymetnInRepo returns the UPDATED INVOICE, not the payment
export const mockPaymentRepositoryData = {
  __esModule: true,
  createPaymetnInRepo: (): any => Promise.resolve({
    id: '1',
    clientName: 'Test Client',
    clientAddress: 'Test Address',
    invoiceDate: '2026-01-01',
    dueDate: '2026-01-10',
    totalAmount: 200,
    outStandingAmount: 0,
    status: 'Paid',
    items: [],
    payments: [
      {
        id: '1',
        invoiceId: '1',
        amount: 200,
        paymentMethod: 'Card',
        paymentDate: new Date()
      }
    ]
  }),
  getPaymentsByInvoiceIdFromRepo: (): any => Promise.resolve([
    {
      id: '1',
      invoiceId: '1',
      amount: 200,
      paymentMethod: 'Card',
      paymentDate: new Date()
    }
  ])
};

