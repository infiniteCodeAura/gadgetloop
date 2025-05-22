import express from "express";
import { isSeller } from "../authentication/user.authentication.js";
import { addProduct, editProductData, validateAddProduct, validateEditProduct, yupAddProductValidate, yupEditProduct } from "./product/product.service.js";
import { isOwner } from "./seller.service.js";

const router = express.Router()

//add product api 
router.post("/product/add",isSeller,validateAddProduct,yupAddProductValidate,addProduct)

router.put("/product/edit/:id",isSeller,validateEditProduct,isOwner,yupEditProduct,editProductData)


export default router

