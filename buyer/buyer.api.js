import express from "express";
import { isBuyer } from "../authentication/user.authentication.js";
import { address, addressValidation, updateAddress, updateAddressValidation } from "./address/address.service.js";
import { commentPost, replyComment, replyCommentValidation, yupValidationComment } from "./comment/comment.services.js";

const router = express()

router.use(express.Router());


//address api 
router.post("/buyer/address",isBuyer,addressValidation,address)

//update address api 
router.put("/buyer/address/update",isBuyer,updateAddressValidation,updateAddress)

//comment api 
router.post("/product/:id/comment",isBuyer,yupValidationComment,commentPost)

//reply comment 
router.post("/product/comment/:commentId/reply",isBuyer,replyCommentValidation,replyComment)

export default router

