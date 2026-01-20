"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import authFetch from "@/lib/authFetch";
import Invoice, { InvoiceData } from "../components/Invoice";

interface Report {
  totalInvoices: number;
  totalAmountBilled: number;
  totalRevenue: number;
  totalOutstandingAmount: number;
  unpaidInvoices: InvoiceData[];
  paidInvoices: InvoiceData[];
  partiallyPaidInvoices: InvoiceData[];
}
export default function DashboardPage() {
  const [report, setReport] = useState<Report | any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchReport() {
    try {
      setError("");
      setLoading(true);

      const response = await authFetch("http://localhost:3000/report", {
        method: "GET",
      });
      const data = await response.json().catch(() => {});

      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setReport(data);
      setLoading(false);
    } catch (err) {
      setError("Unable to fetch the reports. " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return <p> Loading Reports...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <p>
        <strong>Total Invoices: </strong>
        {report.totalInvoices}
      </p>
      <br />
      <p>
        <strong>Unpaid Invoices: </strong>
      </p>
      <ul>
        {report.unpaidInvoices.length > 0 ? (
          report.unpaidInvoices.map(
            (unpaidInvoice: InvoiceData, index: number) => (
              <li key={index}>
                <Invoice data={unpaidInvoice}></Invoice>
              </li>
            ),
          )
        ) : (
          <p>No Unpaid Invoices</p>
        )}
      </ul>
      <br />
      <p>
        <strong>Paid Invoices: </strong>
      </p>
      <ul>
        {report.paidInvoices.length > 0 ? (
          report.paidInvoices.map((paidInvoice: InvoiceData, index: number) => (
            <li key={index}>
              <Invoice data={paidInvoice}></Invoice>
            </li>
          ))
        ) : (
          <p>No Paid Invoices</p>
        )}
      </ul>
      <br />
      <p>
        <strong>Partially paid Invoices: </strong>
      </p>
      <ul>
        {report.partiallyPaidInvoices.length > 0 ? (
          report.partiallyPaidInvoices.map(
            (partiallyPaidInvoice: InvoiceData, index: number) => (
              <li key={index}>
                <Invoice data={partiallyPaidInvoice}></Invoice>
              </li>
            ),
          )
        ) : (
          <p>No Partially Paid Invoices</p>
        )}
      </ul>
      <br />
      <p>
        <strong>Total Amount Billed: </strong>
        {report.totalAmountBilled}
      </p>
      <br />
      <p>
        <strong>Total Revenue: </strong>
        {report.totalRevenue}
      </p>
      <br />
      <p>
        <strong>Total Oustanding Amount: </strong>
        {report.totalOutstandingAmount}
      </p>
      <br />
    </div>
  );
}
