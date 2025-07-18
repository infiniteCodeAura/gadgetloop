import express from "express";
import { file } from "../additional/conf_upload/multer.configure.js";
import { isKyc, isSeller } from "../authentication/user.authentication.js";
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
  // file.any(),
    (req, res, next) => {
    file.any()(req, res, function (err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'You can upload a maximum of 4 Photos.' });
        }
        return res.status(500).json({ error: 'Upload failed', details: err.message });
      }
      next(); // Continue to next middlewares if no error
    });
  },

  isSeller,
  isKyc,
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

// router.post(
//   "/upload/product/:id/video",
//   readVideo.any(),
//   isSeller,
//   productValidation,
//   uploadVideoValidation,
 
//   uploadVideos
// );

router.post(
  "/upload/product/:id/video",

  // Custom multer middleware with error handling
  (req, res, next) => {
    readVideo.any()(req, res, function (err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'You can upload a maximum of 3 videos.' });
        }
        return res.status(500).json({ error: 'Upload failed', details: err.message });
      }
      next(); // Continue to next middlewares if no error
    });
  },

  

  isSeller,
  productValidation,
  uploadVideoValidation,
  uploadVideos
);





//ordered list view

export default router;
