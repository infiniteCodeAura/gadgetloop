import jwt from "jsonwebtoken";
import { ip, ipv6 } from "address";
import { yupSignupValidation } from "./user.validation.js";
import bcrypt from "bcrypt";
import User from "./user.model.js";
import yup from "yup";
import { mail } from "../authMailer/login.validation.mail.js";
export const signupUserValidation = async (req, res, next) => {
  try {
    const userSignupData = req.body;

    await yupSignupValidation.validate(userSignupData);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const signupUser = async (req, res) => {
  const userData = req.body;

  // console.log(userData);

  //check user existance

  const user = await User.findOne({ email: userData.email });

  if (user) {
    return res
      .status(400)
      .json({ message: "User already exist with this email. " });
  }

  //get ip address from user
  const ip4 = ip();
  // const ip4 = "103.225.244.49"

  let device;

  try {
    const url = `http://ip-api.com/json/${ip4}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(400).json({ message: "Something went wrong." });
    }
    // console.log("object");
    const jsonData = await response.json();

    device = jsonData;
  } catch (error) {
    console.log(error);
  }

  if (device.status === "fail") {
    device = {};
  }

  //enctypt password

  const hashPassword = await bcrypt.hash(userData.password, 10);

  userData.password = hashPassword;
  device.status = undefined;

  await User.create({ ...userData, device });

  return res.status(200).json({ message: "Account created." });
};

export const loginUserValidation = async (req, res, next) => {
  const loginUserData = req.body;

  try {
    await yup
      .object({
        email: yup.string().email("Please enter valid email. "),
      })
      .validate({ email: loginUserData.email });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const loginUser = async (req, res) => {
  const userData = req.body;

  //check user existance

  const user = await User.findOne({ email: userData.email });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  //if email is valid then check password match

  const password = await bcrypt.compare(userData.password, user.password);

  if (!password) {
    return res.status(400).json({ message: "Invalid credentials. " });
  }
  //if password is true then generate login token for access

//check if different device 

const ip4 =  ip();

// console.log(user.device.query);

if(ip4 !== user.device.query)
{
  let message = "Unknown login from : "
 
  return  mail()

  

}






  const payload = await jwt.sign(
    {
      email: user.email,
    },
    process.env.key,
    { expiresIn: "24h" }
  );

  //hide specific data from user
  user.device = undefined;
  user.password = undefined;
  return res.status(200).json({ data: user, token: payload });
};

//user update profile apis

//name validation function

export const yupNameValidation = async (req, res, next) => {
  const { firstName, lastName } = req.body;
  try {
    await yup
      .object({
        firstName: yup.string().required("First name is required").trim(),
        lastName: yup.string().required("Last name is required").trim(),
      })
      .validate({ firstName, lastName });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

//first name edit function

export const updateName = async(req, res) => {
  const name = req.body;

//update name  

const update = await User.updateMany({email: req.userData.email},{$set:{
    firstName:name.firstName,lastName: name.lastName
}})

console.log("object");

};

