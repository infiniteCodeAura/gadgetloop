import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import Kyc from "../user/kyc/kyc.model.js";

export const isUser = async (req, res, next) => {
  const userToken = req.headers.authorization;
  //check token is available or not
  if (!userToken) {
    return res.status(404).json({ message: "User token not found. " });
  }
  // console.log(req.cookies.token)

  //split token
  const splitToken = userToken.split(" ");

  const token = splitToken[1];

  // let token = req.cookies.token;


  if (!token) {
    return res.status(400).json({ message: "User token not found. " });
  }

  //decrypt token and find email

  let payload;
  try {
    payload = jwt.verify(token, process.env.key);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  //check user existance for login as a user

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return res.status(400).json({ message: "Unauthorized " });
  }

  user.password = undefined;
  user.device = undefined;

  req.userId = user._id;
  req.userData = user;

  next();
};

export const isBuyer = async (req, res, next) => {
  const userToken = req.headers.authorization;

  if (!userToken) {
    return res.status(404).json({ message: "User token not found. " });
  }

  //split token
  const splitToken = userToken.split(" ");

  const token = splitToken[1];
  // let token = req.cookies.token

  if (!token) {
    return res.status(400).json({ message: "Unauthorized login " });
  }

  //decrypt token and find email

  let payload;
  try {
    payload = jwt.verify(token, process.env.key);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  //check user existance for login as a user

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return res.status(400).json({ message: "Unauthorized " });
  }

  //check is buyer
  if (user.role !== "buyer") {
    return res.status(400).json({ message: "Unauthorized " });
  }

  user.password = undefined;
  user.device = undefined;

  req.userId = user._id;
  req.userData = user;
  

  next();
};

export const isSeller = async (req, res, next) => {
  const userToken = req.headers.authorization;

  if (!userToken) {
    return res.status(404).json({ message: "User token not found. " });
  }

  //split token
  const splitToken = userToken.split(" ");

  const token = splitToken[1];

  // let token = req.cookies.token

  if (!token) {
    return res.status(400).json({ message: "Unauthorized login" });
  }

  //decrypt token and find email

  let payload;
  try {
    payload = jwt.verify(token, process.env.key);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  //check user existance for login as a user

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return res.status(400).json({ message: "Unauthorized " });
  }

  //check is buyer
  if (user.role !== "seller") {
    return res.status(403).json({ message: "Forbidden: Only seller allowed." });
  }

  user.password = undefined;
  user.device = undefined;

  req.userId = user._id;
  req.userData = user;

  next();
};



export const isKyc = async(req,res,next)=>{

const userId = req.userId;

try {
  const findKyc = await Kyc.findOne({userId: userId});

if(!findKyc){
return res.status(400).json({ message: "Please verify your KYC before uploading products to ensure trust and platform security." });
}

} catch (error) {
  return res.status(400).json({message: error.message,stack: error.stack})
}
next();

}

