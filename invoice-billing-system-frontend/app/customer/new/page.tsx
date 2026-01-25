'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import authFetch from '@/lib/authFetch';

export default function CreateCustomerPage(){
    const router = useRouter();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function createCustomer(){
        const requestBody = {name, address, email, isActive: true};
        const response = await authFetch('http://localhost:3000/customers',{method:'POST',body:JSON.stringify(requestBody)})
        if(!response.ok){
            setError(`Failed to create Customer.`);
        } else {
            setSuccess(true);
            router.push('/customer');
        }
    }

    async function handleSubmit(){
        try{
            setError('');
            setLoading(true);
            await createCustomer();
        } catch(err : unknown){
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (<div>
        <h1>Create Customer</h1>
        {error && <p style={{color : 'red'}}>{error}</p>}
        {success && <p style={{color : 'green'}}>Customer created successfully!</p>}
        <label htmlFor='name'>Name</label>
        <input type="text" placeholder='Enter customer name' name='name'required onChange={(e) => setName(e.target.value)}/>
        <br />
        <label htmlFor='address'>Address</label>
        <input type="text" placeholder='Enter address' name='address'required onChange={(e) => setAddress(e.target.value)}/>
        <br />
        <label htmlFor='email'>Email</label>
        <input type="email" placeholder='Enter the email' name='email'required onChange={(e) => setEmail(e.target.value)}/>
        <br />
        <button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Customer'}</button>
    </div>);
}