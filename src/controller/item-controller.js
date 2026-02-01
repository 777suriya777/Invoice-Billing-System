import { getItemsByUserFromRepo, createItemInRepo } from '../repository/item-repository.js';

async function getItems(req,res) {
    const user = req.user && req.user.email;
    if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
    const items  = await getItemsByUserFromRepo(user);
    return res.json(items);
}

async function createItem(req,res){
    try{
        const user = req.user && req.user.email;
        if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
        const {itemName, description, unitPrice} = req.body;
        if (!itemName || !description || !unitPrice) {
            return res.status(400).json({ message: 'Missing required item fields: itemName, description, unitPrice' });
        }
        const item = {itemName, description, unitPrice, createdBy : user};
        await createItemInRepo(item);
        return res.status(201).json({message : `Item ${item.itemName} is created succesfully`});
    } catch(err){
        return res.status(400).json({message : `Something went wrong. ${err.message}`});
    }
}

export {getItems, createItem};