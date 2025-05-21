import { sanitizeData } from "../../utils/sanitizeData.js";
import { yupProductValidation } from "./product.validation.js";

export const validate = async(req ,res ,next)=>{

    let {productName,description,brand,category,price,quantity} = req.body;
   

    
    try {
         productName = sanitizeData(productName);
     description = sanitizeData(description);
     brand = sanitizeData(brand);
     category = sanitizeData(category);
     price = sanitizeData(price);
     quantity = sanitizeData(quantity);
    //for number validation 

    
    } catch (error) {
        return res.status(400).json({message: "Something went wrong. "})
    }
next()
}

export const yupAddProduct = async(req ,res ,next)=>{

 const data = req.body
 try {
    await yupProductValidation.validate(data);
 } catch (error) {
    return res.status(400).json({message: error.message})
 }
    


}


