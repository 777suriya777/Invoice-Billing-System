'use client';

import authFetch from '@/lib/authFetch';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicesPage(){
    const [invoices, setInvoices ] = useState([]);
    const[loading, setLoading ] = useState(true);
    const [error, setError ] = useState('');
    const router = useRouter();

    async function fetchInvoices() {
        const response = await authFetch('http://localhost:3000/invoices',{
        method: 'GET'
        });
        const data = await response.json();
        return data;
    }

    useEffect(() => {
        fetchInvoices()
        .then((invoices : any) => {
            setInvoices(invoices);
        })
        .catch((err : unknown) => {
            const message = (err as Error).message;
            setError(message);
            if(message.includes('UNAUTHORIZED') || message.includes('token')) {
                router.push('/login');
            }
        })
        .finally(() => {
            setLoading(false);
        });
    },[])

    if(loading) return <p>Loading...</p>;
    if(error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Invoices</h1>
            <ul>
                {invoices.map((inv : any) => (
                <li key={inv.id}>
                    <strong>ID:</strong> {inv.id} |
                    <strong> Status:</strong> {inv.status} |
                    <strong> Total:</strong> {inv.totalAmount} |
                    <strong> Outstanding:</strong> {inv.outstandingAmount}
                </li>
                ))}
            </ul>
        </div>
    );
}