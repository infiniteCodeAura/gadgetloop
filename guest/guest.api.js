import express from "express";
import { products, productViewDetails, searchProductGuest } from "./guest.service.js";
const router = express.Router();



router.get("/products",products)
router.get("/product/view/:id",productViewDetails)
router.get("/product/search",searchProductGuest)


export default router;




