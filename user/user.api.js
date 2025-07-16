import express from "express";
import { isUser } from "../authentication/user.authentication.js";
import { loginLimiter } from "../utils/rete.limit.js";
import {
  loginUser,
  loginUserValidation,
  profile,
  signupUser,
  updateEmail,
  updateName,
  updatePassword,
  uploadProfile,
  validateForgotPasswordData,
  validateKyc,
  validateProfile,
  yupNameValidation,
} from "./user.service.js";
import { signupUserValidation } from "./user.service.js ";
import { file } from "../additional/conf_upload/multer.configure.js";
// const upload = multer({ dest: "./upload/profiles/" });

const router = express.Router();

//signup api
router.post("/user/signup", signupUserValidation, signupUser);

//login api
router.post("/user/login", loginUserValidation, loginUser);

//profile data 
router.get("/user/profile",isUser,profile)

//profile edit apis

//first name update api
router.put("/user/profile/name",loginLimiter, isUser, yupNameValidation, updateName);


router.post(
  "/user/profile/image",
  file.any("profile"),
  isUser,
  validateProfile,
  uploadProfile
);

//email update api
router.put("/user/profile/email", loginLimiter, isUser, updateEmail);

//password update api
router.put("/user/profile/password",loginLimiter, isUser, updatePassword);

//password forgot api
router.put("/user/password/forgot", loginLimiter, validateForgotPasswordData);


//kyc verification 
router.post("/user/kyc/verification",file.any("kyc"),isUser,validateKyc)


export default router;
