import bcrypt from "bcrypt";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { publicIpv4 } from "public-ip";
import yup from "yup";
import { loginIp } from "../utils/device/device.data.js";
import Ip from "../utils/device/device.model.js";
import moment from "moment";
import multer from "multer";
import path from "path";
import { mail } from "../authMailer/login.validation.mail.js";
import User from "./user.model.js";
import { yupSignupValidation } from "./user.validation.js";
import { otpGen } from "../utils/device/otp.gen.js";
import mailCode from "../authMailer/forgot.password.js";

//signup user validation
export const signupUserValidation = async (req, res, next) => {
  try {
    const userSignupData = req.body;
    await yupSignupValidation.validate(userSignupData, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

//after signup validation create account
export const signupUser = async (req, res) => {
  const userData = req.body;

  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exist with this email." });
    }

    // Get public IP address
    const ip4 = await publicIpv4();
    let device;

    try {
      const url = `http://ip-api.com/json/${ip4}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(400).json({
          message: "Something went wrong while fetching device info.",
        });
      }

      const jsonData = await response.json();
      device = jsonData.status === "fail" ? {} : jsonData;
      delete device.status;
    } catch (err) {
      console.error("IP API error:", err);
      device = {};
    }

    const hashPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashPassword;

    await User.create({ ...userData, device });
    return res.status(200).json({ message: "Account created." });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//login user validation
export const loginUserValidation = async (req, res, next) => {
  const loginUserData = req.body;

  try {
    await yup
      .object({
        email: yup.string().email("Please enter valid email."),
      })
      .validate({ email: loginUserData.email }, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};
//after login validation create user account
export const loginUser = async (req, res) => {
  const userData = req.body;

  try {
    const user = await User.findOne({ email: userData.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(
      userData.password,
      user.password
    );
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const ipv4 = await publicIpv4();
    // const ipv4 = "103.225.244.20"
    const signupUserIp = await User.findOne({ email: userData.email });

    let message =
      "We noticed a login attempt to your account from a new device or location: ";
    const date = dayjs().format("MMMM D, YYYY, h:mm A");

    if (signupUserIp.device?.query !== ipv4) {
      const device = await loginIp(ipv4);
      delete device.status;

      const data = {
        userId: user._id,
        device,
        date,
      };

      await Ip.create(data);

      //mail it

      mail(
        user.firstName,
        device.country,
        device.city,
        device.query,
        message,
        user.email,
        date
      );
    }

    const token = jwt.sign({ email: user.email }, process.env.key, {
      expiresIn: "24h",
    });

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.device;

    return res.status(200).json({ data: sanitizedUser, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//for updata
//name validation first name or last name for update
export const yupNameValidation = async (req, res, next) => {
  const { firstName, lastName } = req.body;

  try {
    await yup
      .object({
        firstName: yup.string().required("First name is required").trim(),
        lastName: yup.string().required("Last name is required").trim(),
      })
      .validate({ firstName, lastName }, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

//update name from database after validation
export const updateName = async (req, res) => {
  const name = req.body;

  const renameDate = await User.findOne({ _id: req.userId });

  const formatted = moment(renameDate.updatedAt).format("YYYY-MM-DD HH:mm:ss");

  const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

  const diff = moment(currentDate).diff(moment(formatted), "days");

  if (diff <= 15) {
    return res
      .status(400)
      .json({ message: "You can only update your name once every 15 days." });
  }

  try {
    await User.updateMany(
      { email: req.userData.email },
      {
        $set: {
          firstName: name.firstName,
          lastName: name.lastName,
        },
      }
    );

    return res.status(200).json({ message: "Name updated successfully." });
  } catch (err) {
    console.error("Update name error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//update profile picture
export const uploadProfile = async (req, res) => {
  const file = req.file;

  try {
    // Define storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, "./upload/profiles"),
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        const uniqueName = `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.${ext}`;
        cb(null, uniqueName);
      },
    });

    // Allow only jpg, jpeg, png
    const fileFilter = (req, file, cb) => {
      const allowed = ["image/jpeg", "image/jpg", "image/png"];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error("Only jpg, jpeg, png allowed"), false);
    };

    //function call multer
    const upload = multer({ storage });
    //split filename and extention and get extention
    const filext = file.mimetype.split("/")[1];
    //extract filename from file
    const filename = file.filename;
    //merge filename and extention
    const name = `${file.filename}.${filext}`;
    //get the path of the file
    const dst = path.join(`./upload/profiles/${name}`);

    if (!upload) {
      return res.status(400).json({ message: "File not uploaded." });
    }

    //check profile photo is already exist or not

    const user = await User.findOne({ email: req.userData.email });
    console.log(user.profile);

    await User.updateMany(
      {
        email: req.userData.email,
      },
      {
        $set: {
          profile: dst,
        },
      }
    );

    return res.status(200).json({ message: "profile uploaded successfully." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//update email for security reason

export const updateEmail = async (req, res) => {
  const { email, password } = req.body;
  try {
    //email and password validation
    await yup
      .object({
        email: yup
          .string()
          .email("Please enter valid email.")
          .lowercase()
          .trim()
          .required("Email is required."),
        password: yup.string().required("Password is required."),
      })
      .validate({ email, password });

    //check email is already exist or not
    const user = await User.findOne({ email: req.userData.email });

    if (!user) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    //to change email first check the password is correct or not

    //if password is correct then update the email

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .json({ message: "Please enter your correct password." });
    }

    //if user exist then check the email is already exist or not

    if (user.email === email) {
      return res.status(400).json({ message: "You already added this email." });
    }

    await User.updateMany(
      {
        email: req.userData.email,
      },
      {
        $set: {
          email: email,
        },
      }
    );
    return res.status(200).json({ message: "Email updated successfully." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//update password function
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // console.log(oldPassword,newPassword);

  try {
    //user check authorized user or not

    //yup validation for old password and new password
    await yup
      .object({
        newPassword: yup
          .string()
          .required("New password is required.")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
            "New password must be at least 6 characters and include uppercase, lowercase, number, and special character."
          ),
      })
      .validate({ oldPassword, newPassword });

    //check user existance or check valid email/user

    const user = await User.findOne({ email: req.userData.email });

    if (!user) {
      return res.status(400).json({ message: "Unauthorized." });
    }

    //check old password is correct or not
    const checkPassword = await bcrypt.compare(oldPassword, user.password);

    const hashPassword = await bcrypt.hash(newPassword, 10);

    if (!checkPassword) {
      return res
        .status(400)
        .json({ message: "Please enter correct password." });
    }

    //check old or new password is equal or not
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "Your new password can’t be the same as your old password. ",
      });
    }

    //update password
    await User.updateOne(
      { email: req.userData.email },
      {
        $set: {
          password: hashPassword,
        },
      }
    );
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


//forgot password function 
export const validateForgotPasswordData = async(req,res,next)=>{

 const {email} = req.body;
//email validation with error handling 
 try {
  await yup.object({
    email: yup.string().required("Please enter your email.").trim().lowercase().email("Please enter valid email. "),
  }).validate({email})
 } catch (error) {
  return res.status(400).json({message: error.message});
 }
//email validation with error handling 
try {
   //email validation with check existance 

   const user = await User.findOne({email: email});
   
   if(!user){
    return res.status(404).json({message: "User not exist with this email. "})
   }
  
  const otp = await otpGen()
  // const data = {...user.firstName,otp}
  
  if(!otp){
    return res.status(400).json({message: "Something went wrong. "})
  }

//email otp 
  //  mail(otp,user.email,user.firstName)
  mailCode(otp,user.email,user.firstName)



} catch (error) {
  return res.status(400).json({message: error.message});
}

}


