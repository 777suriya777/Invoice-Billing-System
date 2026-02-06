import { getItemsByUserFromRepo, createItemInRepo } from '../repository/item-repository';
import { Request, Response } from 'express';
import { CreateItemSchema } from '../validators/item.schema';

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
        const parsed = CreateItemSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation failed', errors: parsed.error.format() });
        }
        const { itemName, description, unitPrice } = parsed.data as CreateItemBody;
        const item = {itemName, description, unitPrice, createdBy : user};
        await createItemInRepo(item);
        return res.status(201).json({message : `Item ${item.itemName} is created succesfully`});
    } catch(err){
        const error = err as any;
        return res.status(400).json({message : `Something went wrong. ${error.message}`});
    }
}

export {getItems, createItem};
