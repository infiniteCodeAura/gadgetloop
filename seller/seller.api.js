import express from "express";
import {  isSeller } from "../authentication/user.authentication.js";
import {
  addProduct,
  deleteProduct,
  editProductData,
  list,
  search,
  validateEditProduct,
  validateView,
  view,
  yupAddProductValidate,
  yupEditProduct
} from "./product/product.service.js";
import { isOwner } from "./seller.service.js";
// import { isOwner } from "./seller.service.js";

const router = express.Router();

//add product api
router.post(
  "/product/add",
  isSeller,
  yupAddProductValidate,
  addProduct
);

//edit product details
router.put(
  "/product/edit/:id",
  isSeller,
  validateEditProduct,
  isOwner,
  yupEditProduct,
  editProductData
);

//view particular product details
router.get("/product/view/:id", isSeller, isOwner, validateView, view);

//view own product list
router.get("/product/list", isSeller, list);

//for search api
router.get("/product/search", isSeller, search);

//delete product
router.put("/product/delete/:id", isSeller, isOwner, deleteProduct);

//ordered list view 


export default router;
