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

// export const addToCart = async (req, res) => {
//   //get product data and quantity and validate it
//   let productId = req.params.productId;
//   let orderedQuantity = req.body.quantity;

//   //sanitize it
//   try {
//     productId = sanitizeData(productId);
//     orderedQuantity = sanitizeData(orderedQuantity);
//     //get user data from usertoken
//     const userId = req.userId;

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found. " });
//     }

//     //use product price fromproduct
//     let cart = await Cart.findOne({ userId: userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: [], totalQuantity: 0, totalPrice: 0 });
//     }

//     //block added cart if cart item more than stock quantity



//     const existingItem = cart.items.find((item) =>
//       item.productId.equals(productId)
//     );
//     // const totalQuantityToAdd = (existingItem?.quantity || 0) + orderedQuantity;

//     // if (totalQuantityToAdd > product.quantity) {
//     //   return res.status(400).json({ message: "Product is out of stock. " });
//     // }
//     if(existingItem.quantity >=5){
//       return res.status(400).json({message: "You can't add more than 5 product as a cart. "})
//     }



//     //check product and its price
//     const productPrice = await Product.findOne({ _id: productId });
//     if (!productPrice) {
//       return res.status(404).json({ message: "Product not found. " });
//     }
//     // // console.log();
//     // //  console.log(productPrice.price);
//     if (!cart) {
//       cart = new Cart({
//         userId,

//         items: [
//           {
//             productId: productId,
//             price: productPrice.price,
//             quantity: orderedQuantity,
//           },
//         ],
//         totalQuantity: orderedQuantity,
//         totalPrice: orderedQuantity * productPrice.price,
//       });
//     } else {
//       const existingItem = cart.items.find((item) =>
//         item.productId.equals(productId)
//       );
//       console.log(existingItem);
//       if (existingItem) {
//         existingItem.quantity += orderedQuantity;
//         existingItem.price = productPrice.price;
//       } else {
//         cart.items.push({
//           productId: productId,
//           price: productPrice.price,
//           quantity: orderedQuantity,
//         });
//       }
//       cart.totalQuantity += orderedQuantity;
//       cart.totalPrice += orderedQuantity * productPrice.price;
//     }
//     // await cart.save();

//     return res.status(200).json({
//       message: "Item added to cart.",
//       warning:
//         "Note: All cart item will expire after 15 days if not checked out.",
//       cart,
//     });
//   } catch (error) {
//     return res.status(400).json(error.message)
//   }
// };


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
      return res
        .status(400)
        .json({ message: "Not enough stock available." });
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
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await cart.save();

    return res.status(200).json({
      message: "Item added to cart.",
      warning: "Note: All cart items will expire after 15 days if not checked out.",
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

export const cartUpdate = async (req, res) => {
  let { inc, dec } = req.body;
  const productId = req.params;
};
