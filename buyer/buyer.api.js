import express from "express";
import { isBuyer } from "../authentication/user.authentication.js";
import { address, addressValidation, updateAddress, updateAddressValidation } from "./address/address.service.js";
import { commentPost, replyComment, replyCommentValidation, yupValidationComment } from "./comment/comment.services.js";
import { addToCart, cartCount, cartList, cartUpdate, cartUpdateValidation, deleteCart, deleteCartValidation, flushCart, yupCartDataValidation } from "./cart/cart.service.js";
import { orderPayment, orderProduct, orderValidation, paymentValidation } from "./order/order.service.js";
import { isBuy } from "./purchase.auth.js";
import { postReview, reviewValidation } from "./review/review.service.js";

const router = express()

router.use(express.Router());

//add address
//address api 
router.post("/buyer/address",isBuyer,addressValidation,address)

//update address api 
router.put("/buyer/address/update",isBuyer,updateAddressValidation,updateAddress)

//comment
//comment api 
router.post("/product/:id/comment",isBuyer,yupValidationComment,commentPost)

//reply comment api
router.post("/product/comment/:commentId/reply",isBuyer,replyCommentValidation,replyComment)


//cart
//cart api 
router.post("/product/add/cart/:productId",isBuyer,yupCartDataValidation,addToCart)

//cart auto remove functionality 

//cart list api 
router.get("/user/cart/list",isBuyer,cartList);

//count item which added in cart
router.get("/user/cart/item/count",isBuyer,cartCount)

//update cart details 
router.post("/user/cart/:id/update",isBuyer,cartUpdateValidation,cartUpdate)

//delete cart api
router.post("/product/delete/cart/:id",isBuyer,deleteCartValidation,deleteCart)

//cart flush api 
router.delete("/user/cart/flush",isBuyer,flushCart)

//order api 
router.post("/order/product/:id",isBuyer,orderValidation,orderProduct)

 //buy product payment
router.post("/order/product/:id/payment",isBuyer,paymentValidation,orderPayment)

//payment api 
// router.post("/order/product/:id/payment",isBuyer)

router.post("/review/product/:id",isBuyer,isBuy,reviewValidation,postReview)

// router.post("/review/product/:id",isBuyer,isBuy,()=>{console.log("hello there")})


//buy all cart product api 



export default router

