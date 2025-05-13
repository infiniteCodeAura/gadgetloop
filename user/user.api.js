import express from "express";
import { signupUserValidation } from "./user.service.js ";
import { loginUser, loginUserValidation, signupUser, updateName, yupNameValidation } from "./user.service.js";
import { isUser } from "../authentication/user.authentication.js";

const router = express.Router()

//signup api 
router.post("/user/signup",signupUserValidation,signupUser);
 
//login api 
router.post("/user/login",loginUserValidation,loginUser)

//profile edit apis

//first name update api
router.put("/user/profile/name",isUser,yupNameValidation,updateName)

//profile picture upload api 

router.post("/user/profile/profile",(req,res)=>{
    console.log(req.file);
    res.status(200).json({message:"file uploaded"})
}
)


export default router;

