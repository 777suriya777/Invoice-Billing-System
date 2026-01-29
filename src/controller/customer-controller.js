import { getCustomerByEmailFromRepo, createCustomerInRepo } from "../repository/customer-repository.js";

async function getCustomers(req,res) {
    const user = req.user && req.user.email;
    if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
    const customers  = await getCustomerByEmailFromRepo(user);
    return res.json(customers);
}

async function createCustomer(req,res){
    try{
        const user = req.user && req.user.email;
        if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
        const {name, address, email, isActive} = req.body;
        if (!name || !address || !email) {
            return res.status(400).json({ message: 'Missing required customer fields: name, address, email' });
        }
        const customer = {name, address, email, createdBy : user};
        await createCustomerInRepo(customer);
        return res.status(201).json({message : `Customer ${name} is created succesfully`});
    } catch(err){
        return res.status(400).json({message : `Something went wrong. ${err.message}`});
    }
}

export {getCustomers, createCustomer};