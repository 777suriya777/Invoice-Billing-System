import { getCustomerByEmailFromRepo, createCustomerInRepo } from "../repository/customer-repository";
import { Request, Response } from 'express';

async function getCustomers(req: Request, res: Response): Promise<Response> {
    const user = (req.user as any)?.email;
    if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
    const customers  = await getCustomerByEmailFromRepo(user);
    return res.json(customers);
}

interface CreateCustomerBody {
    name: string;
    address: string;
    email: string;
    isActive?: boolean;
}

async function createCustomer(req: Request, res: Response): Promise<Response> {
    try{
        const user = (req.user as any)?.email;
        if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
        const {name, address, email, isActive} = req.body as CreateCustomerBody;
        if (!name || !address || !email) {
            return res.status(400).json({ message: 'Missing required customer fields: name, address, email' });
        }
        const customer = {name, address, email, createdBy : user};
        await createCustomerInRepo(customer);
        return res.status(201).json({message : `Customer ${name} is created succesfully`});
    } catch(err){
        const error = err as any;
        return res.status(400).json({message : `Something went wrong. ${error.message}`});
    }
}

export {getCustomers, createCustomer};
