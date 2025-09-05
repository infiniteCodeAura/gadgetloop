import yup, { Schema } from "yup";
import { sanitizeData } from "../utils/sanitizeData.js";
import { Product } from "../seller/product/product.model.js";
import { Comment } from "./comment/comment.model.js";

export const searchValidation = async (req, res, next) => {
  const { name, category, page = 1 } = req.query;

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
        page: yup.number().min(1).default(1).positive(),
      })
      .noUnknown()
      .validate({ name, category });
  } catch (error) {
    return res.status(400).json({ message: error.message, stack: error.stack });
  }
  next();
};

export const searchProduct = async (req, res) => {
  let { name, category, page = 1 } = req.query;

  try {
    // if (!name) {
    //   name = "";
    // }
    // if (!category) {
    //   category = "";
    // }

    name = sanitizeData(name || "");
    category = sanitizeData(category || "");

    //convert params to int
    page = parseInt(page);
    const limit = 15;
    const skip = (page - 1) * limit;

    //dynamic query
    let query = {};

    if (name?.trim()) {
      query.productName = { $regex: name, $options: "i" };
    }

    if (category?.trim()) {
      query.category = { $regex: category, $options: "i" };
    }

    // const products = await Product.find(query)

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found. " });
    }

    return res.status(200).json({
      count: products.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//comment list of a product comment view 
export const productCommentList = async (req, res) => {
  const { id } = req.params;
  try {
    //fetch product
    const product = await Product.findById(id)
    if(!product){
      return res.status(404).json({message:"Product not found"})
    }
    //fetch comments
    const comments = await Comment.find({productId:id}).populate('userId','firstName lastName email');
    product.comments = comments;
    
console.log(product.comments);

    return res.status(200).json({ comments: product.comments || [] });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }


};








