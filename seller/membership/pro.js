import { checkMongoId } from "../../utils/mongo.id.validation.js";

import fs from "fs";
import path from "path";
import { Product } from "../product/product.model.js";

export const productValidation = async (req, res, next) => {
  //check product id validation
  const productId = req.params.id;

  try {
    const checkId = await checkMongoId(productId);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id." });
    }

    //check product existance in database 

    const findProduct = await Product.findOne({userId:req.userId,_id:productId})

    if(!findProduct){
      return res.status(404).json({message: "Product not found"})
    }

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const uploadVideoValidation = async (req, res, next) => {
  if (req.userData.verifiedAs === "basic") {
    return res.status(400).json({
      message:
        " Please upgrade your plan to access video upload functionality.",
    });
  }

  let video = req.files;
  const maxSize = 50 * 1024 * 1024;
  const allowFormat = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/x-matroska", // .mkv
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
  ];

  try {
    const item = video.every((file) => allowFormat.includes(file.mimetype));

    if (!item) {
      return res.status(400).json({
        message: "Unsupported video format. Please upload a valid video file.",
      });
    }

    if (req.userData.verifiedAs === "pro") {
      const size = video.every((file) => file.size <= maxSize);
      if (!size) {
        return res.status(400).json({
          message:
            "Only Ultimate users can upload without limits. Pro users have restricted upload sizes.",
        });
      }
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const uploadVideos = async (req, res) => {
const productId = req.params.id;

  try {
    const files = req.files;
    const videoPaths = [];
    files.forEach((file)=>{
      const fileName = Date.now() + "-" + file.originalname;
      const uploadPath = path.join("upload/productVideo",fileName);

      fs.writeFileSync(uploadPath,file.buffer);//save from memory
videoPaths.push(uploadPath);
    })

await Product.updateOne({_id: productId,userId:req.userId},{$set:{
  videos: videoPaths
}})

return res.status(200).json({message: "Video upload successfully."})


  } catch (error) {
     return res.status(500).json({
      message: "Upload failed.",
      error: error.message,
    });
  }



};
