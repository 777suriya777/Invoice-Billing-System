import { getItemsByUserFromRepo, createItemInRepo } from '../repository/item-repository';
import { Request, Response } from 'express';

interface CreateItemBody {
    itemName: string;
    description: string;
    unitPrice: number;
}

async function getItems(req: Request, res: Response): Promise<Response> {
    const user = (req.user as any)?.email;
    if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
    const items  = await getItemsByUserFromRepo(user);
    return res.json(items);
}

async function createItem(req: Request, res: Response): Promise<Response> {
    try{
        const user = (req.user as any)?.email;
        if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
        const {itemName, description, unitPrice} = req.body as CreateItemBody;
        if (!itemName || !description || !unitPrice) {
            return res.status(400).json({ message: 'Missing required item fields: itemName, description, unitPrice' });
        }
        const item = {itemName, description, unitPrice, createdBy : user};
        await createItemInRepo(item);
        return res.status(201).json({message : `Item ${item.itemName} is created succesfully`});
    } catch(err){
        const error = err as any;
        return res.status(400).json({message : `Something went wrong. ${error.message}`});
    }
}

export {getItems, createItem};
