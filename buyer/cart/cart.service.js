import { Product } from "../../seller/product/product.model.js";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Cart } from "./cart.model.js";
import { addItemToCartValidationSchema } from "./cart.validations.js";
//add to cart validation
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
//add to cart
export const addToCart = async (req, res) => {
  //get product data and quantity and validate it
  let productId = req.params.productId;
  let orderedQuantity = req.body.quantity;

  //sanitize it
  try {
    productId = sanitizeData(productId);
    orderedQuantity = sanitizeData(orderedQuantity);
    //get user data from usertoken
    const userId = req.userId;

    //use product price fromproduct
    let cart = await Cart.findOne({ userId: userId });
    //check product and its price
    const productPrice = await Product.findOne({ _id: productId });
    if (!productPrice) {
      return res.status(404).json({ message: "Product not found. " });
    }

    if (!cart) {
      cart = new Cart({
        userId,
        price: productPrice.price,
        items: [{ productId: productId, quantity: orderedQuantity }],
        totalQuantity: orderedQuantity,
        totalPrice: orderedQuantity * productPrice.price,
      });
    } else {
      const existingItem = cart.items.find((item) =>
        item.productId.equals(productId)
      );
      if (existingItem) {
        existingItem.quantity += orderedQuantity;
      } else {
        cart.items.push({ productId: productId, quantity: orderedQuantity });
      }
      cart.totalQuantity += orderedQuantity;
      cart.totalPrice += orderedQuantity * productPrice.price;
    }
    await cart.save();

    return res.status(200).json({
      message: "Item added to cart.",
      warning:
        "Note: All cart item will expire after 15 days if not checked out.",
      cart,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//list cart item function
export const cartList = async (req, res) => {
  const userId = req.userId;
  try {
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart item not found. " });
    }

    if (!Array.isArray(cart.items) || cart.items === 0) {
      return res.status(404).json({ message: "Cart is empty. " });
    }

    //use map for read array items
    const cartItems = cart.items.map((item) => ({
      productId: item.productId,
      price: cart.price,
      quantity: item.quantity,
      date: item.createdAt

    }));
    
return res.status(200).json({ 
  item: cartItems,
  totalQuantity: cart.totalQuantity,
  totalPrice: cart.totalPrice
})

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
