import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { addItemToCartValidationSchema } from "./cart.validations.js";

export const yupCartDataValidation = async (req, res, next) => {
  // extract data from params
  const productId = req.params.productId;
  const orderedQuantity = req.body.quantity;

  try {
    //check mongo id validity or product id validity
    const checkId = await checkMongoId(productId);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid Product Id. " });
    }

    await addItemToCartValidationSchema.validate({
      productId,
      orderedQuantity,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};


export const addToCart = async(req,res)=>{

//get product data and quantity and validate it 
let productId = req.params.productId;
let orderedQuantity = req.body.quantity

//sanitize it 
try {
    productId = sanitizeData(productId);
orderedQuantity = sanitizeData(orderedQuantity);
//get user data 
const userId = req.userId
console.log(userId);



} catch (error) {
    return res.status(400).json({message: error.message})
}


}
