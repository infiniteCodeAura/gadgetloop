import yup from "yup";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Product } from "./product.model.js";
import { yupProductValidation } from "./product.validation.js";
import multer from "multer";

/*
add product
*/
//sanitize user input data

// validation using yup
export const yupAddProductValidate = async (req, res, next) => {
  const data = req.body;

  try {
    await yupProductValidation.validate(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};
//add product on db
export const addProduct = async (req, res) => {
  let images = req.files;
  //get user id who add this product
  try {
    const userId = req.userId;

    const data = req.body;
    data.productName = sanitizeData(data.productName);
    data.description = sanitizeData(data.description);
    data.brand = sanitizeData(data.brand);
    data.category = sanitizeData(data.category);
    data.price = sanitizeData(data.price);
    data.quantity = sanitizeData(data.quantity);

    //images validation

    //allow image only filter
    let imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    //filter for image

    const allImagesValid = images.every((file) => {
      return imageMimeTypes.includes(file.mimetype);
    });

    //basic user only can upload upto 5mb
    if (req.userData.verifiedAs === "basic") {
      const imageSize = images.every((file) => {
        return file.size <= 5 * 1024 * 1024;
      });

      if (!allImagesValid) {
        return res.status(400).json({ message: "Upload image only." });
      }
      if (!imageSize) {
        return res
          .status(400)
          .json({
            message:
              "Only pro upgrade members can upload photos larger than 5MB.",
          });
      }
    }

    //for pro user

    if (req.userData.verifiedAs === "pro") {
      if (!allImagesValid) {
        return res.status(400).json({ message: "Upload images only. " });
      }
      const proImageSize = images.every((file) => {
        return file.size <= 20 * 1024 * 1024;
      });

      if (!proImageSize) {
        return res
          .status(400)
          .json({
            message:
              "Only ultimate upgrade members can upload photos larger than 20MB.",
          });
      }
    }

    let mediaName = images.map((img) => {
      return img.path;
    });

    //convert obj to array
    mediaName = Object.values(mediaName);

    //check if already exist same product

    const product = await Product.findOne({
      userId: userId,
      productName: data.productName.trim().toLowerCase(),
    });

    if (product) {
      return res
        .status(400)
        .json({ message: "You already added this product. " });
    }

    const addProductData = {
      ...data,
      medias: { ...mediaName },
      productName: data.productName.trim().toLowerCase(),
      userId,
    };
    // console.log(addProductData)
    //store it on database
    await Product.create(addProductData);
    return res.status(200).json({ message: "Product added successfully. " });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong. " });
  }
};

/*
edit own product
*/

export const validateEditProduct = async (req, res, next) => {
  const productId = req.params;

  try {
    const id = await checkMongoId(productId);

    if (!id) {
      return res.status(400).json({ message: "Invalid product id. " });
    }

    let { productName, description, price, category, brand, quantity } =
      req.body;

    productName = sanitizeData(productName);
    description = sanitizeData(description);
    price = sanitizeData(price);
    category = sanitizeData(category);
    brand = sanitizeData(brand);
    quantity = sanitizeData(quantity);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const yupEditProduct = async (req, res, next) => {
  const data = req.body;
  try {
    await yup
      .object({
        productName: yup
          .string()
          .trim()
          .max(200, "product name exceed 100 characters!!")
          .min(2, "poduct name should contain 2 characters!!"),
        description: yup
          .string()
          .max(2000, "product description exceed 2000 characters!!")
          .min(10, "Description must be at least 10 characters!!")
          .trim(),
        price: yup.number().positive().typeError("price must be a number."),

        category: yup

          .string()

          .trim()

          .max(50, "catagory can't be excees 50 characters!! "),

        brand: yup.string().trim().max(15, "Brand exceed 15 characters!!"),

        quantity: yup

          .number()
          .positive("qualtity must be a positive number !! ")
          .typeError("quantity must be a number!!"),
        image: yup.string().nullable(),
      })
      .noUnknown()
      .validate(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const editProductData = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    // await Product.updateMany({})
    await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ message: "Updated product data. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/*
view particular own product data
*/
export const validateView = async (req, res, next) => {
  //get id from params
  const mongoId = req.params.id;

  try {
    const checkMongoIdValidity = checkMongoId(mongoId);
    if (!checkMongoIdValidity) {
      return res.status(400).json({ message: "Invalid id. " });
    }
  } catch (error) {
    return res.status(400).json({ message: "Invalid id. " });
  }
  next();
};

export const view = async (req, res) => {
  const id = req.params.id;
  //check product existence
  let productData = await Product.find({ _id: id });
  //hide user id
  productData[0].userId = undefined;

  //check deleted product
  if (productData.isArchived === "true") {
    return res.status(400).json({ message: "Product not found" });
  }

  if (!productData) {
    return res.status(400).json({ message: "Product not found" });
  }

  return res.status(200).json({ data: productData });
};
/*
view own product list
*/
//view product list

export const list = async (req, res, next) => {
  try {
    const sellerId = req.userId;
    const page = parseInt(req.query.page) || 1;

    const limit = 20;
    const skip = (page - 1) * limit;

    //count and find only products belong to current seller
    const total = await Product.countDocuments({ userId: sellerId });
    const products = await Product.find({ userId: sellerId })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*
search own product
*/
export const search = async (req, res) => {
  try {
    // validation query

    await yup
      .object()
      .shape({
        search: yup.string().trim().max(100).optional(),
        page: yup
          .number()
          .transform((value, originalValue) => {
            // Transform non-numeric strings to NaN so validation fails
            return isNaN(originalValue) ? NaN : Number(originalValue);
          })

          .integer()
          .positive()
          .default(1),
      })
      .validate(req.query);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const sellerId = req.userId;
    const page = parseInt(req.query.page);
    const limit = 20;
    const skip = (page - 1) * limit;

    const searchTerm = req.query.search || "";

    const query = {
      userId: sellerId,

      productName: { $regex: searchTerm, $options: "i" },
    };

    //count total matching products for this seller + search term
    const total = await Product.countDocuments(query);

    const products = await Product.find(query).skip(skip).limit(limit);

    // console.log(products[0].isArchived);
    //hide deleted products
    if (products[0].isArchived == true) {
      return res.status(404).json({ message: "Product not found. " });
    }

    return res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/*
delete own product
*/
export const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  //check mongoid validity
  try {
    const check = await checkMongoId(productId);
    if (!check) {
      return res.status(400).json({ message: "Invalid product id. " });
    }

    //check product is available or not
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found. " });
    }

    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          isArchived: true,
        },
      }
    );

    return res.status(200).json({ message: "Product Deleted. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
