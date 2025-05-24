import express from "express";
import { address, addressValidation, updateAddress, updateAddressValidation } from "./address/address.service.js";
import { isBuyer, isUser } from "../authentication/user.authentication.js";
import { comment, yupValidationComment } from "./comment/comment.services.js";

const router = express()

router.use(express.Router());


//address api 
router.post("/buyer/address",isBuyer,addressValidation,address)

//update address api 
router.put("/buyer/address/update",isBuyer,updateAddressValidation,updateAddress)

//comment api 
router.post("/product/:id/comment",isBuyer,yupValidationComment,comment)



export default router

