import express from "express";
import { isBuyer, isUser } from "../authentication/user.authentication.js";
import {
  address,
  addressValidation,
  updateAddress,
  updateAddressValidation,
} from "./address/address.service.js";
import { productCommentList, searchProduct, searchValidation } from "./buyer.service.js";
import {
  addToCart,
  cartCount,
  cartList,
  cartUpdate,
  cartUpdateValidation,
  deleteCart,
  deleteCartValidation,
  flushCart,
  yupCartDataValidation,
} from "./cart/cart.service.js";
import {
  commentPost,
  replyComment,
  replyCommentValidation,
  yupValidationComment,
} from "./comment/comment.services.js";
import {
  orderPayment,
  orderProduct,
  orderValidation,
  paymentValidation,
} from "./order/order.service.js";
import { isBuy } from "./purchase.auth.js";
import { postReview, reviewValidation, getReviews } from "./review/review.service.js";

const router = express();

router.use(express.Router());

//add address
//address api
router.post("/buyer/address", isUser, addressValidation, address);

//update address api
router.put(
  "/buyer/address/update",
  isUser,
  updateAddressValidation,
  updateAddress
);

//comment
//comment api
router.post("/product/:id/comment", isUser, yupValidationComment, commentPost);
router.get("/product/:id/comment", isUser, productCommentList);

//reply comment api
router.post(
  "/product/comment/:commentId/reply",
  isUser,
  replyCommentValidation,
  replyComment
);

//cart
//cart api
router.post(
  "/product/add/cart/:productId",
  isUser,
  yupCartDataValidation,
  addToCart
);

//cart auto remove functionality

//cart list api
router.get("/user/cart/list", isUser, cartList);

//count item which added in cart
router.get("/user/cart/item/count", isUser, cartCount);

//update cart details
router.post("/user/cart/:id/update", isUser, cartUpdateValidation, cartUpdate);

//delete cart api
router.post(
  "/product/delete/cart/:id",
  isUser,
  deleteCartValidation,
  deleteCart
);

//cart flush api
router.delete("/user/cart/flush", isUser, flushCart);

//order api
router.post("/order/product/:id", isUser, orderValidation, orderProduct);

//buy product payment
router.post(
  "/order/product/:id/payment",
  isUser,
  paymentValidation,
  orderPayment
);

//payment api
// router.post("/order/product/:id/payment",isBuyer)

router.post(
  "/review/product/:id",
  isUser,
  isBuy,
  reviewValidation,
  postReview
);
router.get("/review/product/:id", isUser, getReviews);

//search product through name catagory
router.get("/product/search", isUser, searchValidation, searchProduct);

//fetch all comments of a product
router.get("/product/:id/list", isUser, productCommentList);


//buy all cart product api



//stript individual product payment api 
router.post("/order/product/cart/payment", isUser)



export default router;
