import express from "express";
import multer from "multer";
import { isUser } from "../authentication/user.authentication.js";
import { loginUser, loginUserValidation, signupUser, updateEmail, updateName, updatePassword, uploadProfile, yupNameValidation } from "./user.service.js";
import { signupUserValidation } from "./user.service.js ";
const upload = multer({ dest: "./upload/profiles/" });

const router = express.Router()




//signup api 
router.post("/user/signup",signupUserValidation,signupUser);
 
//login api 
router.post("/user/login",loginUserValidation,loginUser)

//profile edit apis

//first name update api
router.put("/user/profile/name",isUser,yupNameValidation,updateName)

//profile picture upload api 

router.post("/user/profile/image",isUser,upload.single("profile"),uploadProfile)

//email update api 
router.put("/user/profile/email",isUser,updateEmail)

//password update api 
router.put("/user/profile/password",isUser,updatePassword)


export default router;

