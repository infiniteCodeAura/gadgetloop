import yup from "yup";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { Product } from "../../seller/product/product.model.js";

export const orderValidation = async (req, res, next) => {
  const {quantity} = req.body;
  const productId = req.params.id;
  try {
    //check mongo id validity
    const checkId = await checkMongoId(productId);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id. " });
    }

    await yup
      .object({
        quantity: yup
          .number()
          .required("Product is required. ")
          .min(1, "Atleast 1 product must be selected. "),
      })
      .validate({quantity});
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const orderProduct = async(req,res)=>{

const productId = req.params.id;
const {quantity} = req.body;
const userId = req.userId;

//check product existance 
const product = await Product.findOne({_id: productId});
if(!product){
    return res.status(400).json({message: "Product not found."});
}

//check product quantity (is out of stock ?)
if(quantity > product.quantity){
    return res.status(400).json({message: "Product out of stock. "})
}






}

