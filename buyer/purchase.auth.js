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

    // Find an order by this user that contains the product and is delivered
    const order = await Order.findOne({
      userId: userId,
      "products.productId": productId,
      orderStatus: "delivered"
    });

    if (!order) {
      return res.status(404).json({
        message: "You can only review products you have purchased and received."
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
