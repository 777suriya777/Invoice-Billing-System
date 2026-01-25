'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authFetch from '../../../lib/authFetch';
import { ComboBox } from '@/app/components/ComboBox';

type InvoiceItem = {
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

interface Customer {
    name: string;
    address: string;
    email: string;
    isActive: boolean;
}

interface Item {
    itemName: string;
    description: string;
    unitPrice: number;
    isActive: boolean;
}


export default function NewInvoicePage() {
    const router = useRouter();
    const [clientName, setClientName] = useState('');
    const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
    const [clientAddress, setClientAddress] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
    const [itemName, setItemName] = useState('');
    const [itemOptions, setItemOptions] = useState<Item[]>([]);
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [unitPrice, setUnitPrice] = useState(0);
    const [error, setError] = useState('');
    const [customersLoading, setCustomersLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [customersError, setCustomersError] = useState('');
    const [itemsError, setItemsError] = useState('');


    const grandTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2);

    function handleAddLineItem() {
        if (itemName.trim() === '' || description.trim() === '' || quantity <= 0 || unitPrice <= 0) {
            setError('Please fill out all line item fields with valid values');
            return;
        }

        setError('');

        const newItem: InvoiceItem = {
            itemName,
            description,
            quantity,
            unitPrice
        };
        setLineItems(prevItems => [...prevItems, newItem]);

        // Clear input fields after adding
        setItemName('');
        setDescription('');
        setQuantity(0);
        setUnitPrice(0);
    }

    async function handleSubmit() {

        if (lineItems.length === 0) {
            setError('Please add at least one line item');
            return;
        }

        const requestBody = {
            clientName,
            clientAddress,
            invoiceDate,
            dueDate,
            items: lineItems
        };

        setError('');

        const response = await authFetch('http://localhost:3000/invoices', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            setError('Failed to create invoice');
        } else {
            router.push('/invoices');
            setError('');
        }
    }

    async function fetchCustomers() {
        setCustomersError('');
        setCustomersLoading(true);
        try {
            const response = await authFetch('http://localhost:3000/customers', { method: 'GET' });
            if (!response.ok) {
                setCustomersError('Failed to fetch Customers');
            } else {
                const data = await response.json().catch(() => { });
                setCustomerOptions(data);
            }
        } catch (err: any) {
            setCustomersError(`Something went wrong: ${err.message}`);
        } finally {
            setCustomersLoading(false);
        }
    }

    async function fetchItems() {
        setItemsError('');
        setItemsLoading(true);
        try {
            const response = await authFetch('http://localhost:3000/items', { method: 'GET' });
            if (!response.ok) {
                setItemsError('Failed to fetch Items');
            } else {
                const data = await response.json().catch(() => { });
                setItemOptions(data);
            }
        } catch (err: any) {
            setItemsError(`Something went wrong: ${err.message}`);
        } finally {
            setItemsLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomers();
        fetchItems();
    }, []);

    function onSelectOptionsForCustomer(customer: Customer) {
        setClientAddress(customer.address);
        setClientName(customer.name);
    }

    function onSelectItemOptions(item: Item) {
        setDescription(item.description);
        setUnitPrice(item.unitPrice);
        setItemName(item.itemName);
    }

    return (<div>
        <h1>New Invoice</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="invoice-form-header">
            <label htmlFor="clientName">Client Name</label>
            <ComboBox value={clientName} onChange={setClientName} onSelect={onSelectOptionsForCustomer} options={customerOptions} placeholder='Select a customer'
                isLoading={customersLoading}
                getOptionLabel={(customer) => customer.name}
                renderOption={(customer) => (
                    <div>
                        <strong>{customer.name}</strong>
                        <br />
                        <small>{customer.address?.substring(0, 50)}...</small>
                    </div>
                )} />
            {customersError && <p style={{ color: 'red' }}>{customersError}</p>}
            <br />
            <textarea name="clientAddress" placeholder="Client Address" rows={4} cols={3} value={clientAddress} onChange={e => setClientAddress(e.target.value)}></textarea>
            <br />
            <label htmlFor="invoiceDate">Invoice Date</label>
            <input type="date" name="invoiceDate" required onChange={e => setInvoiceDate(e.target.value)} />
            <br />
            <label htmlFor="dueDate">Due Date</label>
            <input type="date" name="dueDate" required onChange={e => setDueDate(e.target.value)} />
            <br />
        </div>
        <div className="invoice-form-line-items">
            <h2>Line Items</h2>
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Line Item Total</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((item, index) => (
                        <tr key={index}>
                            <td>{item.itemName}</td>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unitPrice}</td>
                            <td>{item.quantity * item.unitPrice}</td>
                            <td><button type="button" onClick={() => setLineItems(prevItems => prevItems.filter((_, i) => i !== index))}>Delete</button></td>
                        </tr>
                    ))}
                    <tr>
                        <td><ComboBox value={itemName} onChange={setItemName} options={itemOptions} onSelect={onSelectItemOptions} placeholder='Select an Item'
                            isLoading={itemsLoading}
                            getOptionLabel={(item) => item.itemName}
                            renderOption={(item) => (
                                <div>
                                    <strong>{item.itemName}</strong>
                                    <br />
                                    <small>{item.description?.substring(0, 50)}...</small>
                                    <br />
                                    <small>{item.unitPrice}</small>
                                </div>
                            )} /></td>
                        <td><input type="text" name="description" value={description} required onChange={e => setDescription(e.target.value)} /></td>
                        <td><input type="number" name="quantity" value={quantity} required onChange={e => setQuantity(parseInt(e.target.value) || 0)} /></td>
                        <td><input type="number" name="unitPrice" value={unitPrice} required onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)} /></td>
                        <td><input type="number" name="total" value={unitPrice * quantity} readOnly /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                        <td style={{ fontWeight: 'bold' }}>{grandTotal}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <button type="button" onClick={handleAddLineItem}>Add Line Item</button>
        </div>
        <button type='button' onClick={handleSubmit} disabled={lineItems.length === 0}>Create Invoice</button>
    </div>);
}