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
export const comment = async (req, res) => {
  let data = req.body;
 
  try {
     let productId = req.params.id;

    //check mongo id
    const checkProductId = await checkMongoId(productId);

    if (!checkProductId) {
      return res.status(400).json({ message: "Invalid product id. " });
    }
    //validate body data
       productId =  new mongoose.Types.ObjectId(productId);

    data.comment = sanitizeData(data.comment);
    data.star = sanitizeData(data.star);

    // get userdata
    const userData = req.userData;
    const firstName = userData.firstName;
    const userId = userData._id;

   
    const comment = {productId,userId,firstName,...data}
    //store it in database 

    await Comment.create(comment)
    return res.status(200).json({message: "Comment posted."})


  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
