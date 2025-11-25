import { Product } from "../../seller/product/product.model.js";
import User from "../../user/user.model.js";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import yup from "yup";
import Review from "./review.model.js";
import { sanitizeData } from "../../utils/sanitizeData.js";

export const reviewValidation = async (req, res, next) => {
  let productId = req.params.id;

  //check id validity
  const checkId = await checkMongoId(productId);
  if (!checkId) {
    return res.status(400).json({ message: "Invalid id. " });
  }

  next();
};

export const postReview = async (req, res) => {
  let productId = req.params.id;
  const userId = req.userId;
  const data = req.body;
  const product = await Product.findById(productId);
  const user = await User.findById(userId);

  //sanitize data
  try {
    data.rating = sanitizeData(data.rating);
    data.feedback = sanitizeData(data.feedback);

    let reviewData = { ...data, userId, productId };
    // console.log(reviewData)
    //check product is available or not for post review
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found with this id. " });
    }

    // disallow reviews for archived/deleted products
    if (product.isArchived === true) {
      return res.status(404).json({ message: "Product not found with this id. " });
    }

    let review = await Review.findOne({ userId: userId, productId: productId });

    if (!data.feedback) {
      return res.status(400).json({ message: "Feedback is required. " });
    }

    if (data.rating < 1 || data.rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    if (data.feedback.length >= 1000) {
      return res.status(400).json({
        message:
          "Feedback is too long. Only 1000 characters are allowed. Please shorten your feedback.",
      });
    }

    if (!review) {
      await Review.create(reviewData);
      return res.status(200).json({ message: "Review updated. " });
    }

    await Review.updateOne(
      { userId: userId, productId: productId },
      {
        $set: {
          feedback: data.feedback,
          rating: data.rating,
        },
      }
    );
    return res.status(200).json({ message: "Feedback updated." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getReviews = async (req, res) => {
  const productId = req.params.id;
  try {
    const checkId = await checkMongoId(productId);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id." });
    }

    const reviews = await Review.find({ productId }).populate("userId", "firstName lastName profile");

    // Transform to match frontend expectation if needed
    const formattedReviews = reviews.map(r => ({
      _id: r._id,
      rating: r.rating,
      feedback: r.feedback,
      user: {
        name: r.userId ? `${r.userId.firstName} ${r.userId.lastName}` : "Anonymous",
        profile: r.userId?.profile
      },
      date: r.createdAt
    }));

    return res.status(200).json({ reviews: formattedReviews });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
