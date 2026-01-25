const memoryStore = require('../memory-store');

function _getItemArray(){
    let items = memoryStore.get('items');
    if(!Array.isArray(items)){
        items = [];
        memoryStore.set('items',items);
    }
    return items;
}

async function getItems(req,res) {
    const user = req.user && req.user.email;
    if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
    const items  = _getItemArray().filter((item) => item.createdBy === user);
    return res.json(items);
}

async function createItem(req,res){
    try{
        const user = req.user && req.user.email;
        if(!user) return res.status(401).json({message : 'Unauthorized: missing user email'});
        const {itemName, description, unitPrice, isActive} = req.body;
        if (!itemName || !description || !unitPrice) {
            return res.status(400).json({ message: 'Missing required item fields: itemName, description, unitPrice' });
        }
        const item = {itemName, description, unitPrice, isActive, createdBy : user};
        const items = _getItemArray();
        items.push(item);
        memoryStore.set('items', items);
        return res.status(201).json({message : `Item ${item.itemName} is created succesfully`});
    } catch(err){
        return res.status(400).json({message : `Something went wrong. ${err.message}`});
    }
}

module.exports = {getItems, createItem};