import { Product } from "../seller/product/product.model.js";
import * as yup from "yup";

export const products = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments({ isArchived: false });
    const products = await Product.find({ isArchived: false })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({   
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}


export const productViewDetails = async (req, res) => {
  const { id } = req.params;

  // Validate the ID format (assuming it's a MongoDB ObjectId)
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  const productData = await Product.findById(id);
  if (!productData) {
    return res.status(404).json({ message: "Product not found" });
  }

  // check deleted/archived product
  if (productData.isArchived === true) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json({ data: productData });
};



//search product for guest user 

export const searchProductGuest = async (req, res, next) => {
  let { name, category,brand,page } = req.query;

  const schema = yup.object().shape({
    name: yup.string().trim().nullable().notRequired(),
    category: yup.string().trim().nullable().notRequired(),
  });

  try {
    await schema.validate({ name, category });

   //search logic 
    const query = {};

    if (name) {
      query.productName = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    if (category) {
      query.category = { $regex: category, $options: "i" }; // Case-insensitive search
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" }; // Case-insensitive search
    }

    // Pagination logic
    const pageNumber = parseInt(page) || 1;
    const limit = 15;
    const skip = (pageNumber - 1) * limit;

    // exclude archived products
    query.isArchived = false;

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    return res.status(200).json({
      count: products.length,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limit),
      products,
    }); 

    // pass to next middleware or return response
    return res.status(200).json({ name, category });

  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message, stack: error.stack });
  }
};

