import mongoose from "mongoose";
import yup from "yup";
import mailCommentReply from "../../authMailer/notification.mail.js";
import { Product } from "../../seller/product/product.model.js";
import User from "../../user/user.model.js";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Comment } from "./comment.model.js";
import validator from "validator";
const { equals } = validator;

export const yupValidationComment = async (req, res, next) => {
  // get product id from params
  const productId = req.params.id;

  const data = { ...req.body, productId };
  try {
    await yup
      .object({
        productId: yup.string().required("Product ID is required"),

        comment: yup
          .string()
          .min(3, "Message must be at least 3 characters")
          .max(200, "message must be at most 200 characters. ")
          .required("Comment message is required"),
      })
      .noUnknown(true, { message: "Unknown field in request" })
      .strict(true)
      .validate(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

//add comment function
export const commentPost = async (req, res) => {
  let data = req.body;

  try {
    let pId = req.params.id;

    //check mongo id
    const checkProductId = await checkMongoId(pId);

    if (!checkProductId) {
      return res.status(400).json({ message: "Invalid product id. " });
    }
    //validate body data
    const productId = new mongoose.Types.ObjectId(pId);
    const findProduct = await Product.findOne({ _id: pId });
    if (!findProduct) {
      return res.status(404).json({ message: "Product not found. " });
    }
    data.comment = sanitizeData(data.comment);
    data.star = sanitizeData(data.star);

    // get userdata
    const userData = req.userData;
    const firstName = userData.firstName;
    const userId = userData._id;

    const comment = { productId, userId, firstName, ...data };
    //     const commentData = await Comment.findOne({userId: req.userId})
    // console.log(commentData);

    //store it in database

    await Comment.create(comment);
    res.status(200).json({ message: "Comment posted." });

    //get product data
    const product = await Product.findOne({ _id: productId });
    if (!product)
      return res.status(404).json({ message: "Product not found. " });

    //get owner of product data
    const productOwner = await User.findOne({ _id: product.userId });
    if (!productOwner)
      return res.status(404).json({ message: "Product owner not found. " });
    //message for comment to mail

    let message = " has commented on your product. Please check it out.";

    //block sending email to self
    if (!product.userId.equals(userId)) {
      await mailCommentReply(
        productOwner.email,
        req.userData.firstName,
        message
      );
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//reply comment by user
export const replyCommentValidation = async (req, res, next) => {
  const id = req.params.commentId;
  const data = req.body;
  try {
    //check mongo id validity
    const checkId = await checkMongoId(id);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    if (typeof data.replyComment === "string") {
      data.replyComment = data.replyComment.trim();
    } else {
      return res.status(400).json({ message: "replyComment must be a string" });
    }

    await yup
      .object({
        replyComment: yup
          .string()
          .min(3, "Reply comment must be at least 3 characters. ")
          .required("Comment is required. ")
          .trim(),
      })
      .noUnknown(true, { message: "Unknown field in request" })
      .strict(true)
      .validate(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const replyComment = async (req, res) => {
  //sanitize data
  let data = req.body;
  const commentId = req.params.commentId;

  try {
    if (typeof data.replyComment === "string") {
      data.replyComment = data.replyComment.trim();
    } else {
      return res.status(400).json({ message: "replyComment must be a string" });
    }

    data.replyComment = sanitizeData(data.replyComment);

    //get userid
    const userId = req.userId;
    const name = req.userData.firstName;

    //collect data who reply in specific comment
    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found. " });
    //  console.log(comment);
    comment.replies.push({
      userId: userId,
      firstName: name,
      reply: data.replyComment,
    });

    await comment.save();

    //reply mail who is comment owner

    let message = `replied your to comment! check it out on gadgetloop.com/${comment.productId}`;

    //fetch original commenter
    const commentOwner = await User.findOne({ _id: comment.userId });
    if (!commentOwner)
      return res.status(404).json({ message: "Comment owner not found. " });

    if (!comment.userId.equals(userId)) {
      //  console.log(userId,comment.replies[0].userId);
      await mailCommentReply(
        commentOwner.email,
        commentOwner.firstName,
        message
      );
      return res.status(200).json({ message: "reply sent" });
    }

    return res.status(200).json({ message: "Reply sent. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
    // console.log(error);
  }
};
