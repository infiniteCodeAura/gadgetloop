import yup from "yup";
import { checkMongoId } from "../../utils/mongo.id.validation.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Comment } from "./comment.model.js";
import mongoose from "mongoose";

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
        star: yup
          .number()
          .required("Star rating is required")
          .min(1, "Minimum star rating is 1")
          .max(5, "Maximum star rating is 5"),
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
    let productId = req.params.id;

    //check mongo id
    const checkProductId = await checkMongoId(productId);

    if (!checkProductId) {
      return res.status(400).json({ message: "Invalid product id. " });
    }
    //validate body data
    productId = new mongoose.Types.ObjectId(productId);

    data.comment = sanitizeData(data.comment);
    data.star = sanitizeData(data.star);

    // get userdata
    const userData = req.userData;
    const firstName = userData.firstName;
    const userId = userData._id;

    const comment = { productId, userId, firstName, ...data };
    //store it in database

    await Comment.create(comment);
    return res.status(200).json({ message: "Comment posted." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//reply comment by user
export const replyCommentValidation = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    //check mongo id validity
    const checkId = await checkMongoId(id);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    if (typeof data.replyComment === 'string') {
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
  const id = req.params.id;

  try {
if (typeof data.replyComment === 'string') {
    data.replyComment = data.replyComment.trim();
} else {
    return res.status(400).json({ message: "replyComment must be a string" });
}
console.log(data.replyComment);

    data.replyComment = sanitizeData(data.replyComment);

    //get userid
    const userId = req.userId;
    const name = req.userData.firstName;

    //collect data who reply in specific comment
    const comment = await Comment.findOne({
      productId: id,
      userId: req.userId,
    });
    //  console.log(comment);
    comment.replies.push({
      userId: userId,
      firstName: name,
      reply: data.replyComment,
    });

    await comment.save();
     res.status(200).json({ message: "Reply sent. " });
    console.log("object");
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
