interface InvoiceItem {
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

interface Payment {
  amount: number;
  method: string;
  createdBy: string;
  paidAt: string;
}

export interface InvoiceData {
  clientName: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  email: string;
  items: InvoiceItem[];
  taxRate: number;
  subTotal: number;
  taxAmount: number;
  totalAmount: number | string;
  outstandingAmount: number | string;
  createdAt: string;
  updatedAt : string;
  payments?: Payment[];
}

interface InvoiceProps{
    data : InvoiceData;
}

const Invoice = ({ data } : InvoiceProps) => {
  // Guard clause in case data is still loading
  if (!data) return null;

  return (
    <div className="invoice-wrapper">
      {/* Header Info */}
      <header>
        <div className="client-info">
          <h1>Invoice</h1>
          <p>Client: {data.clientName}</p>
          <p>Address: {data.clientAddress}</p>
        </div>

        <div className="invoice-meta">
          <p>Date: {data.invoiceDate}</p>
          <p>Due Date: {data.dueDate}</p>
        </div>
      </header>

      {/* Items Table */}
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items?.map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.itemName}</td>
              <td>{item.quantity}</td>
              <td>{item.unitPrice}</td>
              <td>{(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <section className="invoice-summary">
        <div>
          <span>Subtotal:</span>
          <span>{data.subTotal}</span>
        </div>
        <div>
          <span>Tax:</span>
          <span>{data.taxAmount}</span>
        </div>
        <div>
          <strong>Total Amount:</strong>
          <strong>{data.totalAmount}</strong>
        </div>
        <div>
          <span>Outstanding Balance:</span>
          <span>{data.outstandingAmount}</span>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>Last Updated: {data.updatedAt}</p>
        {data.payments && data.payments?.length > 0 && (
          <p>Payments recorded: {data.payments.length}</p>
        )}
      </footer>
    </div>
  );
};

export default Invoice;