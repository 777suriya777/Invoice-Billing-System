import { jest } from '@jest/globals';
import { mockAuthMiddlewareData, mockPaymentRepositoryData } from './setup/mocks';

jest.mock('../middleware/auth-middleware', () => mockAuthMiddlewareData);

jest.mock('../repository/payment-repository', () => ({
  __esModule: true,
  createPaymetnInRepo: jest.fn(mockPaymentRepositoryData.createPaymetnInRepo),
  getPaymentsByInvoiceIdFromRepo: jest.fn(mockPaymentRepositoryData.getPaymentsByInvoiceIdFromRepo)
}));

import supertest from 'supertest';
import app from '../index';

describe('Payment Tests', () => {
  describe('Create Payment', () => {
    test('Should create a payment for an invoice and return 200', async () => {
      const paymentData = {
        amount: 200,
        paymentMethod: 'Card'
      };

      const response = await supertest(app)
        .post('/payments/1')
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Payment successful');
      console.log('Payment created:', response.body);
    });

    test('Should fail to create payment with invalid data', async () => {
      const invalidPaymentData = {
        // Missing amount and paymentMethod
      };

      await supertest(app)
        .post('/payments/1')
        .send(invalidPaymentData)
        .expect(400);
    });

    test('Should fail to create payment with negative amount', async () => {
      const invalidPaymentData = {
        amount: -100,
        paymentMethod: 'Card'
      };

      await supertest(app)
        .post('/payments/1')
        .send(invalidPaymentData)
        .expect(400);
    });

    test('Should fail to create payment with invalid payment method', async () => {
      const invalidPaymentData = {
        amount: 100,
        paymentMethod: 'CREDIT_CARD'
      };

      await supertest(app)
        .post('/payments/1')
        .send(invalidPaymentData)
        .expect(400);
    });
  });

  describe('Get Payments', () => {
    test('Should get payments for an invoice', async () => {
      const response = await supertest(app)
        .get('/payments/1')
        .expect(200);

      // Response contains a payments array property
      expect(response.body).toHaveProperty('payments');
      expect(Array.isArray(response.body.payments)).toBe(true);
      console.log('Payments retrieved:', response.body);
    });
  });

  describe('Payment Validation Tests', () => {
    test('Should reject zero amount payment', async () => {
      const paymentData = {
        amount: 0,
        paymentMethod: 'Card'
      };

      await supertest(app)
        .post('/payments/1')
        .send(paymentData)
        .expect(400);
    });

    test('Should accept valid payment methods only', async () => {
      const validMethods = ['Card', 'Bank Transfer', 'UPI', 'Cash'];
      
      for (const method of validMethods) {
        const paymentData = {
          amount: 100,
          paymentMethod: method
        };

        const response = await supertest(app)
          .post('/payments/1')
          .send(paymentData);

        // Should not return 400 for invalid payment method
        expect(response.status).not.toBe(400);
      }
    });
  });
});
