import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const isUser = async (req, res, next) => {
 
    const userToken = req.headers.authorization;
    //check token is available or not
    if (!userToken) {
      return res.status(404).json({ message: "User token not found. " });
    }

    //split token
    const splitToken = userToken.split(" ");

    const token = splitToken[1];

    if(!token){
        return res.status(400).json({message: "Somthing went wrong. "});

    }

    //decrypt token and find email 

    const payload = jwt.verify(token,process.env.key);

    //check user existance for login as a user 

    const user = await User.findOne({email: payload.email});

    if(!user){
        return res.status(400).json({message: "Unauthorized "})
    }

    user.password = undefined;
    user.device = undefined;


req.userId = user._id;
req.userData = user;
 
  next();
};


export const isBuyer = (req,res,next) => {
    // console.log("object");
}

