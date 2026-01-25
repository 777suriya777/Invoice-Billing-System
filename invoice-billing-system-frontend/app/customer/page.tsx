'use client';

import { useState, useEffect } from 'react';
import authFetch from '@/lib/authFetch';
import { useRouter } from 'next/navigation';

export default function CustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchCustomers() {
            try {
                setError('');
                setLoading(true);
                const response = await authFetch('http://localhost:3000/customers', { method: 'GET' });
                if (!response.ok) {
                    setError('Failed to fetch customers.');
                    setCustomers([]);
                } else {
                    const data = await response.json();
                    setCustomers(data);
                }
            } catch (err: any) {
                setError(`Something went wrong: ${err.message}`);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCustomers();
    }, []);

    if (loading) {
        return <div>Loading customers...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Customers</h1>
            <button onClick={() => router.push('/customer/new')}>Create New Customer</button>
            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer: any, index: number) => (
                            <tr key={index}>
                                <td>{customer.name}</td>
                                <td>{customer.address}</td>
                                <td>{customer.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
