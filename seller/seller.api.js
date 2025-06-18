import express from "express";
import { isSeller } from "../authentication/user.authentication.js";
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
import { upload, uploadMedia } from "../utils/multer.js";
// import { isOwner } from "./seller.service.js";
// const upload = multer({dest: "../upload"})


const router = express.Router();

//multer configuration 


//add product api
router.post(
  "/product/add",
  // upload.any("images"),
  uploadMedia,
  isSeller,
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
