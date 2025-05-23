import express from "express";
import { address, addressValidation, updateAddress, updateAddressValidation } from "./address/address.service.js";
import { isBuyer, isUser } from "../authentication/user.authentication.js";

const router = express()

router.use(express.Router());


//address api 
router.post("/buyer/address",isBuyer,addressValidation,address)

//update address api 
router.put("/buyer/address/update",isBuyer,updateAddressValidation,updateAddress)

export default router

