'use client';
import{ useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage(){
    const router = useRouter();

    //Protect the dashboard route
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard!</p>
        </div>
    );
}