import express from "express";
import { isSeller } from "../authentication/user.authentication.js";
import { addProduct, deleteProduct, editProductData, validateAddProduct, validateEditProduct, yupAddProductValidate, yupEditProduct } from "./product/product.service.js";
import { isOwner } from "./seller.service.js";

const router = express.Router()

//add product api 
router.post("/product/add",isSeller,validateAddProduct,yupAddProductValidate,addProduct)


//edit product details
router.put("/product/edit/:id",isSeller,validateEditProduct,isOwner,yupEditProduct,editProductData)

//delete product
router.put("/product/delete/:id",isSeller,isOwner,deleteProduct)




export default router

