import yup from "yup";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { Product } from "../../seller/product/product.model.js";
import { Address } from "../address/address.model.js";
import { Order } from "./order.model.js";
import { v4 as uuidv4 } from "uuid";

export const orderValidation = async (req, res, next) => {
  const { quantity } = req.body;
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
      .validate({ quantity });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const orderProduct = async (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  //get user data from token
  const userData = req.userData;

  try {
    //check product existance
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    //check product quantity (is out of stock ?)
    if (quantity > product.quantity) {
      return res.status(404).json({ message: "Product out of stock. " });
    }

    //get user address data
    const address = await Address.findOne({ userId: userData._id });

    if (!address) {
      return res
        .status(500)
        .json({ message: "You haven't added a primary address for ordering." });
    }

    //create user order data

    const productPrice = product.price;
    const totalAmount = quantity * productPrice;
    let orderId = uuidv4();
    //order data
    const orderData = {
      orderId,
      userId: userData._id,
      products: [
        {
          productId: product._id,
          name: product.productName,
          price: productPrice,
          quantity: quantity,
        },
      ],
      totalAmount,

      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        address1: address.address1,
        city: address.city,
      },
      statusHistory: [
        {
          status: "processing",
          updatedAt: new Date(),
        },
      ],
    };

    const newOrder = await Order.create(orderData);

    //reduce stock or changes stock ( edit product main db )

    product.quantity -= quantity;
    await product.save();
    return res
      .status(201)
      .json({ message: "Order placed successfully.", order: newOrder });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//for payment

export const paymentValidation = async (req, res, next) => {
  const productId = req.params.id;
  const quantity = req.body.quantity;
  try {
    await yup
      .object({
        productId: yup.string().required("Invalid product Id. "),
        quantity: yup.number().required("Quantity is required to proceed. "),
      })
      .validate({ productId, quantity });

    //check mongo validation
    const checkId = await checkMongoId(productId);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid id." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  next();
};

const orderPayment = async(req,res)=>{
const productId = req.params.id
let quantity = req.body.quantity

//validate mongo id 
const id = await checkMongoId(productId);
if(!id){
  return res.status(400).json({message: "Invalid id "});

}


}

