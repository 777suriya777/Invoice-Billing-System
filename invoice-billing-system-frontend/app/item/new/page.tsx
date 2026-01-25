'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import authFetch from '@/lib/authFetch';

export default function CreateItemPage(){
    const router = useRouter();
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function createItem(){
        const requestBody = {itemName, description, unitPrice};
        const response = await authFetch('http://localhost:3000/items',{method:'POST',body:JSON.stringify(requestBody)})
        if(!response.ok){
            setError(`Failed to create Item.`);
        } else {
            setSuccess(true);
            router.push('/item');
        }
    }

    async function handleSubmit(){
        try{
            setError('');
            setLoading(true);
            await createItem();
        } catch(err : unknown){
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (<div>
        <h1>Create Item</h1>
        {error && <p style={{color : 'red'}}>{error}</p>}
        {success && <p style={{color : 'green'}}>Item created successfully!</p>}
        <label htmlFor='itemName'>Item Name</label>
        <input type="text" placeholder='Enter item name' name='itemName'required onChange={(e) => setItemName(e.target.value)}/>
        <br />
        <label htmlFor='description'>Description</label>
        <input type="text" placeholder='Enter description' name='description'required onChange={(e) => setDescription(e.target.value)}/>
        <br />
        <label htmlFor='unitPrice'>Unit Price</label>
        <input type="number" placeholder='Enter the price' name='unitPrice'required onChange={(e) => setUnitPrice(e.target.value)}/>
        <br />
        <button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Item'}</button>
    </div>);
}