import { object } from "yup";
import { Product } from "../seller/product/product.model.js";
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

    const order = await Order.findOne({ userId: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found. " });
    }

    //product is still available or not check 

    let checkProduct = await Product.findOne({_id: productId});
    if(!checkProduct){
      return res.status(404).json({message: "Product not found. "})
    }
    if(checkProduct.isArchived === true){
      return res.status(404).json({message: "Product not found. "})
    }

    // let orderProductCheck = order.products.findIndex((item) => {
    //   //  return console.log(item.productId)
    //   return item.productId?.toString() === productId;
    // });
    let orderProductCheck = order.products.some((item) => {
      //  return console.log(item.productId)
      return item.productId?.toString() === productId;
    });

    if (!orderProductCheck) {
      return res.status(404).json({ message: "Product not found in order. " });
    }

    if (order.orderStatus !== "delivered") {
      return res
        .status(400)
        .json({
          message: "You can't leave feedback before the product is delivered.",
        });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
