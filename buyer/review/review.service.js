import { checkMongoId } from "../../utils/mongo.id.validation.js";

export const reviewValidation = async(req , res ,next )=>{

    let productId = req.params.id;

    //check id validity 
    const checkId = await checkMongoId(productId);
    if(!checkId){
        return res.status(400).json({message: "Invalid id. "})
    }

    

}

