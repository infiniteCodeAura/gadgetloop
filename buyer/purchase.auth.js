import { checkMongoId } from "../utils/mongo.id.validation.js";
import { Order } from "./order/order.model.js";

export const isBuy = async (req, res, next) => {
  const productId = req.params.id;
  //check mongo id validity
  try {
    const checkId = await checkMongoId(productId);

    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id. " });
    }

    const userId = req.userId;

//find order 
const order = await Order.find({userId: userId});

if(!order){
    return res.status(404).json({message: "Order not placed. "})
}




  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
