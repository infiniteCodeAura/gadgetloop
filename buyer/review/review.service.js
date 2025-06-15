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

export const postReview = async(req,res)=>{

    let productId = req.params.id;
    const userId = req.userId;
    const data = req.body
    const product = await Product.findById(productId)
    const user = await User.findById(userId);
    
    //sanitize data 
    data.rating = sanitizeData(data.rating);
    data.feedback = sanitizeData(data.feedback)


    let reviewData = {...data,userId,productId}
    // console.log(reviewData)
//check product is available or not for post review 
if(!product){
    return res.status(404).json({message: "Product not found with this id. "})
}

let review = await Review.findOne({userId: userId});

if(!review){
    await Review.create(reviewData)
    return res.status(200).json({message: "Review updated. "})
}

if(review){
    console.log("already exist")
}

}




