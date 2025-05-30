import express from "express";
import { isBuyer } from "../authentication/user.authentication.js";
import { address, addressValidation, updateAddress, updateAddressValidation } from "./address/address.service.js";
import { commentPost, replyComment, replyCommentValidation, yupValidationComment } from "./comment/comment.services.js";
import { addToCart, cartList, cartUpdate, cartUpdateValidation, yupCartDataValidation } from "./cart/cart.service.js";

const router = express()

router.use(express.Router());


//address api 
router.post("/buyer/address",isBuyer,addressValidation,address)

//update address api 
router.put("/buyer/address/update",isBuyer,updateAddressValidation,updateAddress)

//comment api 
router.post("/product/:id/comment",isBuyer,yupValidationComment,commentPost)

//reply comment api
router.post("/product/comment/:commentId/reply",isBuyer,replyCommentValidation,replyComment)

//cart api 
router.post("/product/add/cart/:productId",isBuyer,yupCartDataValidation,addToCart)

//cart auto remove functionality 

//cart list api 
router.get("/user/cart/list",isBuyer,cartList);

//update cart details 
router.post("/user/cart/update",isBuyer,cartUpdateValidation,cartUpdate)

export default router

