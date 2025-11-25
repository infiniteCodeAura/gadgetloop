import express from "express";
import { products, productViewDetails, searchProductGuest } from "./guest.service.js";
import { validateContact, submitContact } from "./contact/contact.service.js";
const router = express.Router();



router.get("/products", products)
router.get("/product/view/:id", productViewDetails)
router.get("/product/search", searchProductGuest)
 
// Contact form route (public - no authentication required)
router.post("/contact", validateContact, submitContact)


export default router;
