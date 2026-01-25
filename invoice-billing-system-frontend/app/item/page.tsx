'use client';

import { useState, useEffect } from 'react';
import authFetch from '@/lib/authFetch';
import { useRouter } from 'next/navigation';

export default function ItemListPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchItems() {
            try {
                setError('');
                setLoading(true);
                const response = await authFetch('http://localhost:3000/items', { method: 'GET' });
                if (!response.ok) {
                    setError('Failed to fetch items.');
                    setItems([]);
                } else {
                    const data = await response.json();
                    setItems(data);
                }
            } catch (err: any) {
                setError(`Something went wrong: ${err.message}`);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, []);

    if (loading) {
        return <div>Loading items...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Items</h1>
            <button onClick={() => router.push('/item/new')}>Create New Item</button>
            {items.length === 0 ? (
                <p>No items found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Description</th>
                            <th>Unit Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, index: number) => (
                            <tr key={index}>
                                <td>{item.itemName}</td>
                                <td>{item.description}</td>
                                <td>{item.unitPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
