import { jest } from '@jest/globals';
import { mockAuthMiddlewareData, mockInvoiceRepositoryData } from './setup/mocks';

jest.mock('../middleware/auth-middleware', () => mockAuthMiddlewareData);

jest.mock('../repository/invoice-repository', () => ({
  __esModule: true,
  getInvoicesByUserFromRepo: jest.fn(mockInvoiceRepositoryData.getInvoicesByUserFromRepo),
  getInvoiceByIdFromRepo: jest.fn(mockInvoiceRepositoryData.getInvoiceByIdFromRepo),
  createInvoiceInRepo: jest.fn(mockInvoiceRepositoryData.createInvoiceInRepo),
  updateInvoiceStatusInRepo: jest.fn(mockInvoiceRepositoryData.updateInvoiceStatusInRepo)
}));

import supertest from 'supertest';
import app from '../index';

describe('Invoice Tests', () => {
  describe('Health endpoint', () => {
    test('Health endpoint should return 200', async () => {
      await supertest(app).get('/health').expect(200)
        .then((res) => {
          expect(res.body.message).toBe('Server is healthy');
        })
    });
  });

  describe('Get Invoices', () => {
    test('Should fetch invoices and return 200', async () => {
      const response = await supertest(app).get('/invoices').expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('clientName');
      console.log('Invoices fetched:', response.body);
    });
  });

  describe('Create Invoice', () => {
    test('Should create an invoice with line items and return 201', async () => {
      const invoiceData = {
        clientName: 'Test Client',
        clientAddress: 'Test Address',
        invoiceDate: '2026-01-01',
        dueDate: '2026-01-10',
        items: [
          {
            itemName: 'Service',
            description: 'Consulting',
            quantity: 2,
            unitPrice: 100,
          }
        ]
      };

      const response = await supertest(app)
        .post('/invoices')
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.clientName).toBe('Test Client');
      expect(response.body.totalAmount).toBe(200);
      expect(response.body.items).toHaveLength(1);
      console.log('Invoice created:', response.body);
    });

    test('Should fail to create invoice with missing required fields', async () => {
      const invalidData = {
        clientName: 'Test Client'
        // Missing required fields
      };

      await supertest(app)
        .post('/invoices')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Update Invoice Status', () => {
    test('Should update invoice status to Paid', async () => {
      const statusData = {
        status: 'Paid'
      };

      const response = await supertest(app)
        .patch('/invoices/1/status')
        .send(statusData)
        .expect(200);

      expect(response.body.status).toBe('Paid');
      console.log('Invoice status updated:', response.body);
    });
  });
});
