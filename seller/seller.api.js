import express from "express";
import { validate, yupAddProduct } from "./product/product.service.js";

const router = express.Router()


router.post("/add/product",validate,yupAddProduct)




export default router

