'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage(){
    const [email,setEmail ] = useState('');
    const [password,setPassword ] = useState('');
    const [error, setError ] = useState('');
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        
        const reqestBody = {
            email,
            password
        };

        setError('');

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reqestBody),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }
            else{
                console.log('Login successful');
                const data = await response.json();
                localStorage.setItem('token', data.token);
                router.push('/dashboard');
            }
        } catch (err : unknown) {
            setError((err as Error).message);
        }
    }
    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" name="email" required onChange = {(e) => setEmail(e.target.value)}/>
                <br />
                <label htmlFor="password">Password</label>
                <input type="password" name="password" required onChange = {(e) => setPassword(e.target.value)} />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}