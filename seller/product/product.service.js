import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Product } from "./product.model.js";
import { yupProductValidation } from "./product.validation.js";
import yup from "yup";
/*
edit product
*/
//sanitize user input data
export const validateAddProduct = async (req, res, next) => {
  let { productName, description, brand, category, price, quantity } = req.body;

  try {
    productName = sanitizeData(productName);
    description = sanitizeData(description);
    brand = sanitizeData(brand);
    category = sanitizeData(category);
    price = sanitizeData(price);
    quantity = sanitizeData(quantity);
    //for number validation
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong. " });
  }
  next();
};
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
  //get user id who add this product

  try {
    const userId = req.userId;

    const data = req.body;

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
      productName: data.productName.trim().toLowerCase(),
      userId,
    };
    //store it on database
    await Product.create(addProductData);
    return res.status(200).json({ message: "Product added successfully. " });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong. " });
  }
};

/*
edit product
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
