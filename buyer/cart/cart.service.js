import mongoose from "mongoose";
import { Product } from "../../seller/product/product.model.js";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Cart } from "./cart.model.js";
import { addItemToCartValidationSchema } from "./cart.validations.js";
import yup from "yup";

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
  let productId = req.params.productId;
  let orderedQuantity = req.body.quantity;

  try {
    // Sanitize input
    productId = sanitizeData(productId);
    orderedQuantity = sanitizeData(orderedQuantity);

    const userId = req.userId;

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalQuantity: 0, totalPrice: 0 });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find((item) =>
      item.productId.equals(productId)
    );

    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const totalQuantityToAdd = currentQuantityInCart + orderedQuantity;

    // Limit per user
    if (totalQuantityToAdd > 7) {
      return res.status(400).json({
        message: "You can't add more than 7 of this product to the cart.",
      });
    }

    // Check available stock
    if (totalQuantityToAdd > product.quantity) {
      return res.status(400).json({ message: "Not enough stock available." });
    }

    // Update cart item
    if (existingItem) {
      existingItem.quantity = totalQuantityToAdd;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        productId: productId,
        price: product.price,
        quantity: orderedQuantity,
      });
    }

    // Recalculate total cart quantity and price
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: "Item added to cart.",
      warning:
        "Note: All cart items will expire after 15 days if not checked out.",
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
      price: item.price,
      quantity: item.quantity,
      date: item.createdAt,
    }));

    return res.status(200).json({
      item: cartItems,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//update cart data (quantity )

export const cartUpdateValidation = async (req, res, next) => {
  const { inc, dec } = req.body;

  try {
    await yup
      .object({
        inc: yup.number().required("Increase value is required. ").optional(),
        dec: yup.number().required("Decrease value is required. ").optional(),
      })
      .validate({ inc, dec });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

//cart update function
export const cartUpdate = async (req, res) => {
  let { inc, dec } = req.body;
  const productId = req.params.id;
  const userId = req.userId;
try {
  //cart validation n sanitize
inc = sanitizeData(inc);
dec = sanitizeData(dec);

const checkProductId = await checkMongoId(productId);

if ((inc && dec) || (!inc && !dec)) {
  return res.status(400).json({message: "Invalid operation. Use exactly one of 'inc' or 'dec'."});
}


if(!checkProductId){
  return res.status(400).json({message: "Invalid Product Id. "})
}

  //check product existance 
  const product = await Product.findOne({_id: productId});

if(!product){
  return res.status(400).json({message: "Product not found. "})
}

//if found product then check cart db 


const cart = await Cart.findOne({userId: userId})
// console.log("User Cart:", JSON.stringify(cart, null, 2));

if(!cart){
  return res.status(404).json({message: "Cart not found. "})
}


const itemIndex = cart.items.findIndex(item =>
  item.productId.equals(new mongoose.Types.ObjectId(productId))
);


if(itemIndex === -1){
  return res.status(404).json({message: "Product not in cart. "})
}
// console.log(itemIndex);
const item = cart.items[itemIndex];
//prevent adding more than 7 product to cart.
if(inc){
  if(item.quantity >=7){
    return res.status(400).json({message : "Maximum 7 items allowed per product. "})
  }


//prevent adding beyond stock 
if(item.quantity +1 > product.quantity){
  return res.status(400).json({message : "Not enough stock available. "})

}

item.quantity+=1;


}
else if(dec){
  item.quantity -=1;

if(item.quantity <=0){
  cart.items.splice(itemIndex,1)


}


}
else{
  return res.status(400).json({message : "Invalid operation. use 'inc' or 'dec'. "})
}

cart.totalQuantity = cart.items.reduce((sum,item)=>sum+item.quantity,0);
cart.totalPrice = cart.items.reduce((sum,item)=>sum+item.quantity * item.price,0);

await cart.save()
return res.status(200).json({message: "Cart updated successfully. ",cart})

} catch (error) {
  return res.status(400).json({message: error.message})
}



};
