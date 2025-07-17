import bcrypt from "bcrypt";
import dayjs from "dayjs";
import fs from "fs";
import jwt from "jsonwebtoken";
import moment from "moment";
import path from "path";
import { publicIpv4 } from "public-ip";
import validator from "validator";
import yup from "yup";
import mailCode from "../authMailer/forgot.password.js";
import { mail } from "../authMailer/login.validation.mail.js";
import { deleteUploadFile } from "../utils/delete.image.js";
import { otpGen } from "../utils/otp.gen.js";
import { emailSanitize, sanitizeData } from "../utils/sanitizeData.js";
import { loginIp } from "./device/device.data.js";
import Ip from "./device/device.model.js";
import Kyc from "./kyc/kyc.model.js";
import User from "./user.model.js";
import { yupSignupValidation } from "./user.validation.js";

//signup user validation
export const signupUserValidation = async (req, res, next) => {
  try {
    const userSignupData = req.body;
    let firstName = sanitizeData(userSignupData.firstName);
    let lastName = sanitizeData(userSignupData.lastName);
    let email = emailSanitize(userSignupData.email);
    let role = sanitizeData(userSignupData.role);

    userSignupData.firstName = firstName;
    userSignupData.lastName = lastName;
    userSignupData.email = email;
    userSignupData.role = role;

    await yupSignupValidation.validate(userSignupData, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

//after signup validation create account
export const signupUser = async (req, res) => {
  let userData = req.body;

  try {
    let firstName = sanitizeData(userData.firstName);
    let lastName = sanitizeData(userData.lastName);
    let email = emailSanitize(userData.email);
    let role = sanitizeData(userData.role);

    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.email = email;
    userData.role = role;

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
    return res.status(500).json({ message: "Internal server error." });
  }
};

//login user validation
export const loginUserValidation = async (req, res, next) => {
  let loginUserData = req.body;

  let email = emailSanitize(loginUserData.email);
  loginUserData.email = email;

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
  let userData = req.body;

  let email = emailSanitize(userData.email);
  userData.email = email;

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
    user.password = undefined;
    user._id = undefined;
    user.device = undefined;
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ data: sanitizedUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
//profile

export const profile = (req, res) => {
  try {
    const user = req.userData;

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const userObj = user.toObject();

    delete userObj._id;

    return res.status(200).json({ data: userObj });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//for update
//name validation first name or last name for update
export const yupNameValidation = async (req, res, next) => {
  let { firstName, lastName } = req.body;

  firstName = sanitizeData(firstName);
  lastName = sanitizeData(lastName);
  req.body.firstName = firstName;
  req.body.lastName = lastName;

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
  let { firstName, lastName } = req.body;

  firstName = sanitizeData(firstName);
  lastName = sanitizeData(lastName);
  req.body.firstName = firstName;
  req.body.lastName = lastName;

  const renameDate = await User.findOne({ _id: req.userId });

  const formatted = moment(renameDate.updatedAt).format("YYYY-MM-DD HH:mm:ss");

  const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

  const diff = moment(currentDate).diff(moment(formatted), "day");

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
          firstName: firstName,
          lastName: lastName,
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

export const validateProfile = async (req, res, next) => {
  try {
    let profilePhoto = req.files;

    if (!profilePhoto) {
      return res.status(400).json({ message: "Please upload photo." });
    }

    const allowFormat = [
      "image/jpeg", // .jpg, .jpeg
      "image/png", // .png
      "image/webp", // .webp
      "image/gif", // .gif
      "image/svg+xml", // .svg
      "image/bmp", // .bmp
      "image/tiff", // .tif, .tiff
      "image/x-icon", // .ico
    ];
    const maxSize = 30 * 1024 * 1024;
    let photo = profilePhoto?.every((file) =>
      allowFormat.includes(file.mimetype)
    );

    let photoSize = profilePhoto?.every((file) => file.size <= maxSize);

    if (profilePhoto?.length > 1) {
      return res
        .status(400)
        .json({ message: "Only 1 photo is allowed as a profile picture." });
    }

    if (!photo) {
      return res
        .status(400)
        .json({ message: "Only photos are allowed as a profile picture. " });
    }

    if (!photoSize) {
      return res.status(400).json({
        message: "The photo is too large. Please upload a smaller image.",
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const uploadProfile = async (req, res) => {
  try {
    const profilePhoto = req.files.find((file) => file.fieldname === "profile");

    if (!profilePhoto) {
      return res.status(400).json({ error: "No profile photo uploaded" });
    }
    //find already profile exist or not
    const findPhoto = await User.findOne({ _id: req.userId });

    let deleteProfilePhotoName = findPhoto?.profile?.split("/").at(-1);

    //get real file name and extention

    // let name = req.file.originalname
    let uploadProfileExt = profilePhoto.originalname.split(".").at(-1);

    const fileName = `${Date.now()}-${findPhoto._id}.${uploadProfileExt}`;

    // if already exist photo then delete it from folder and db

    if (findPhoto.profile) {
      deleteUploadFile(deleteProfilePhotoName);
    }
    const uploadPath = path.join("upload/profiles", fileName);

    const folderPath = path.join("upload", "profiles");

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(uploadPath, profilePhoto.buffer);

    console.log(uploadPath);
    //store photo url in db

    await User.updateOne(
      { email: req.userData.email },
      { $set: { profile: uploadPath } }
    );

    return res.status(200).json({ message: "profile uploaded successfully." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//update email for security reason

export const updateEmail = async (req, res) => {
  // let { email, password } = req.body;
  let email = emailSanitize(req.body.email);
  let password = req.body.password;
  try {
    email = emailSanitize(email);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

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
  let { oldPassword, newPassword } = req.body;
  // console.log(oldPassword,newPassword);

  try {
    //validation

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
    return res.status(200).json({ message: "Password updated successfully. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//forgot password function
export const validateForgotPasswordData = async (req, res, next) => {
  let { email } = req.body;
  //  sanitizeData(email);
  email = emailSanitize(email);

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email " });
  }

  //email validation with error handling
  try {
    await yup
      .object({
        email: yup
          .string()
          .required("Please enter your email.")
          .trim()
          .lowercase()
          .email("Please enter valid email. "),
      })
      .validate({ email });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  //email validation with error handling
  try {
    //email validation with check existance

    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not exist with this email. " });
    }

    const otp = await otpGen();
    // const data = {...user.firstName,otp}
    if (!otp) {
      return res.status(400).json({ message: "Something went wrong. " });
    }

    //email otp
    //  mail(otp,user.email,user.firstName)
    await mailCode(otp, user.email, user.firstName);

    //store code on database for temporary time

    await User.updateOne(
      { email: email },
      {
        $set: {
          code: otp,
        },
      }
    );

    //delete otp from db
    setTimeout(async () => {
      await User.updateOne(
        { email: email },
        {
          $set: {
            code: null,
          },
        }
      );
    }, 2 * 60 * 1000);

    return res
      .status(200)
      .json({ message: "Please check your email for OTP code. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//user kyc verification

export const validateKyc = async (req, res, next) => {
  const data = req.body;
  const images = req.files;

  const allowImageFormat = [
    "image/jpeg", // .jpg, .jpeg
    "image/png", // .png
    "image/webp", // .webp
    "image/gif", // .gif
    "image/svg+xml", // .svg
    "image/bmp", // .bmp
    "image/tiff", // .tif, .tiff
    "image/x-icon", // .ico
  ];

  // validate

  try {
    //data validation

    await yup
      .object({
        firstName: yup
          .string()
          .required("First name is required. ")
          .trim()
          .lowercase(),
        lastName: yup
          .string()
          .required("Lastname name is required. ")
          .trim()
          .lowercase(),
        email: yup
          .string()
          .email("Please insert valid email.")
          .required("Email is required. ")
          .lowercase(),
        address: yup.string().required("Address is required.").trim(),
      })
      .validate(data);

    //block multiple images

    //photo limit
    if (images.length > 2) {
      return res
        .status(400)
        .json({ message: "User can't upload more than 2 photos" });
    }

    //get image data and validate
    let fieldNames = images.map((img) => img.fieldname);
    // console.log(fieldNames);
    if (!fieldNames[0]) {
      return res
        .status(400)
        .json({ message: "Sim ownership proof is required." });
    }
    if (!fieldNames[1]) {
      return res
        .status(400)
        .json({ message: "Your pp size photo is required." });
    }

    //image validation

    const imgFormat = images.every((item) =>
      allowImageFormat.some((format) => item.mimetype.includes(format))
    );

    if (!imgFormat) {
      return res.status(400).json({
        message:
          "Upload failed: Only image formats like JPG, PNG, JPEG, or WEBP are allowed.",
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message, error: error.stack });
  }
  next();
};

export const kyc = async (req, res) => {
  try {
    let { firstName, lastName, email, address } = req.body;

    firstName = sanitizeData(firstName);
    lastName = sanitizeData(lastName);
    email = emailSanitize(email);
    address = sanitizeData(address);

    let images = req.files;

    //if already verified ? block it
    const findKyc = await Kyc.findOne({ userId: req.userId });

    if (findKyc) {
      return res
        .status(400)
        .json({
          message:
            "KYC already verified. No further submission is allowed at this time.",
        });
    }

    // extract image ext

    let ext = images.map((img) =>
      img.originalname.split(".").at(-1).toLowerCase()
    );

    // const kycData = [];
    let fileNames = images.map((img, index) => {
      let extentions = ext[index];
      let randomCode = Math.floor(Math.random() * 900000) + 1;

      return `${Date.now()}-${req.userData.firstName}-${
        req.userData.lastName
      }-${req.userId}-${randomCode}.${extentions}`;
    });

    let kyc = [];

    images.forEach((file, index) => {
      let uploadPath = path.join("upload/kyc", fileNames[index]);
      let folderPath = path.join("upload", "kyc");

      //check folder-- exist? ok : create

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      fs.writeFileSync(uploadPath, file.buffer);
      kyc.push(uploadPath);
    });

    // const isVerify = await Kyc.findOne({userId: req.userId})

    let data = {
      userId: req.userId,
      kycData: [
        {
          firstName,
          lastName,
          email,
          address,
          simOwner: kyc[0],
          ppImage: kyc[1],
        },
      ],
    };
    await Kyc.create(data);

    return res.status(200).json({ message: "KYC updated " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
