import { Product } from "./product/product.model.js";

export const isOwner = async(req ,res ,next )=>{

    let id = req.params.id;

    try {
        //check product is abailable or not with this 
        const product = await Product.findOne({_id: id})
        if(!product){
            return res.status(404).json({message: "Product not exist. "})
        }

        //if yes then check it for owner 

        if(product.userId.toString() !== req.userId.toString()){
           
return res.status(403).json({message:"You don't have the right to change this. "})
        }

        if(product.isArchived == true){
            return res.status(404).json({message: "Products not found"})
        }

      
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
   
next();

}

