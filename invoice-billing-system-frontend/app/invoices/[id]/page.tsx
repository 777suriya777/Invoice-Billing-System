"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import authFetch from "@/lib/authFetch";

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = params.id;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  async function fetchInvoice() {
    try {
      setLoading(true);
      setError("");
      const response = await authFetch(
        `http://localhost:3000/invoices/${invoiceId}`,
        { method: "GET" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setInvoice(data);
    } catch (err: unknown) {
      const error = err as Error;
      setError("Unable to fetch invoice. " + error.message + ".");
    } finally {
      setLoading(false);
    }
  }

  async function sendInvoice() {
    try {
      setError("");
      setLoading(true);
      const requestBody = JSON.stringify({ status: "Sent" });
      const response = await authFetch(
        `http://localhost:3000/invoices/${invoiceId}/status`,
        { method: "PATCH", body: requestBody },
      );
      const data = await response.json().catch(() => {});
      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setInvoice(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  async function makePayment() {
    try {
      setError("");
      setValidationError("");
      setLoading(true);

      if (
        paymentAmount <= 0 ||
        paymentAmount > invoice.outstandingAmount ||
        paymentMethod === ""
      ) {
        if (paymentMethod === "")
          setValidationError("Select a valid payment method");
        else setValidationError("Invalid payment amount");

        setLoading(false);
        return;
      }

      const requestBody = JSON.stringify({
        amount: paymentAmount,
        paymentMethod,
      });
      const response = await authFetch(
        `http://localhost:3000/payments/${invoiceId}`,
        { method: "POST", body: requestBody },
      );
      const data = await response.json().catch(() => {});

      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
      await fetchInvoice();
      setPaymentAmount(0);
      setPaymentMethod("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!invoice) return <p>No invoice found.</p>;

  return (
    <div>
      <h1>Invoice Details Page</h1>
      <div className="invoice-header">
        <ul>
          {/* 4. Access the data from the state */}
          <li>
            <strong>Client Name:</strong> {invoice.clientName}
          </li>
          <li>
            <strong>Client Name:</strong> {invoice.clientAddress}
          </li>
          <li>
            <strong>Date:</strong> {invoice.invoiceDate}
          </li>
          <li>
            <strong>Due Date:</strong> {invoice.dueDate}
          </li>
        </ul>
      </div>
      <br />
      <div className="invoice-line-items">
        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, index: number) => {
              return (
                <tr key={index}>
                  <td>{item.itemName}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.amount}</td>
                </tr>
              );
            })}
            <tr>
              <td style={{ textAlign: "right" }} colSpan={4}>
                Total
              </td>
              <td style={{ fontWeight: "bold" }}>{invoice.totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="SendButton">
        <button
          className="send-button"
          disabled={invoice.status !== "Draft"}
          onClick={sendInvoice}
        >
          Send Invoice
        </button>
      </div>
      <div className="payment-section">
        {(invoice.status === "Sent" || invoice.status === "Partially Paid") && (
          <div>
            <h2>Make Payment</h2>
            {validationError && (
              <p style={{ color: "red" }}>{validationError}</p>
            )}
            <p>Outstanding Balance : {invoice.outstandingAmount}</p>
            <input
              type="number"
              placeholder="Payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Select payment method</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
            <button onClick={makePayment} disabled={loading}>
              Pay
            </button>
            {invoice.payments.length > 0 && (
              <div className="payment-history">
                <br />
                <h3>Payment History</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th> Payment Method</th>
                      <th>Created By</th>
                      <th>Paid At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((paymentInfo: any, index: number) => (
                      <tr key={index}>
                        <td>{paymentInfo.amount}</td>
                        <td>{paymentInfo.method}</td>
                        <td>{paymentInfo.createdBy}</td>
                        <td>{paymentInfo.paidAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
