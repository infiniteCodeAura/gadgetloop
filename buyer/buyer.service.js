import yup, { Schema } from "yup";
import { sanitizeData } from "../utils/sanitizeData.js";
import { Product } from "../seller/product/product.model.js";

export const searchValidation = async (req, res, next) => {
  const { name, category } = req.query;

  try {
    await yup
      .object({
        name: yup
          .string()
          .trim()
          .matches(/^[a-z0-9\s]*$/, "Only letters, numbers, and spaces allowed")
          .lowercase()
          .max(100, "Name too long")
          .nullable(),
        category: yup
          .string()
          .trim()
          .lowercase()
          .max(50, "Category too long")
          .matches(/^[a-z\s]*$/, "Only letters and spaces allowed")
          .nullable(),
      })
      .noUnknown()
      .validate({ name, category });
  } catch (error) {
    return res.status(400).json({ message: error.message, stack: error.stack });
  }
  next();
};

export const searchProduct = async (req, res) => {
  let { name, category } = req.query;

  try {
    // if (!name) {
    //   name = "";
    // }
    // if (!category) {
    //   category = "";
    // }

    name = sanitizeData(name);
    category = sanitizeData(category);

    //dynamic query
    let query = {};

    if (name?.trim()) {
      query.productName = { $regex: name, $options: "i" };
    }

    if (category?.trim()) {
      query.category = { $regex: category, $options: "i" };
    }
    
    const products = await Product.find(query)


   
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found. " });
    }

    return res.status(200).json({ count: products.length, products });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
