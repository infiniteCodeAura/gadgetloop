import express from "express";
import { file } from "../additional/conf_upload/multer.configure.js";
import { isSeller } from "../authentication/user.authentication.js";
import { productValidation, uploadVideos, uploadVideoValidation } from "./membership/pro.js";
import { readVideo } from "./membership/uploadVideo/multer.video.js";
import {
  addProduct,
  deleteProduct,
  editProductData,
  list,
  productImageValidation,
  search,
  validateEditProduct,
  validateView,
  view,
  yupAddProductValidate,
  yupEditProduct,
} from "./product/product.service.js";
import { isOwner } from "./seller.service.js";
// import { isOwner } from "./seller.service.js";
// const upload = multer({dest: "../upload"})

const router = express.Router();

//multer configuration

//add product api
router.post(
  "/product/add",
  // upload.any("images"),
  file.any(),
  isSeller,
  yupAddProductValidate,
  productImageValidation,
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

//premium user

router.post(
  "/upload/product/:id/video",
  readVideo.any(),
  isSeller,
  productValidation,
  uploadVideoValidation,
 
  uploadVideos
);

//ordered list view

export default router;
