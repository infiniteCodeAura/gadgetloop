import { ip } from "address";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import yup from "yup";
import { loginIp } from "../device/device.data.js";
import Ip from "../device/device.model.js";

import User from "./user.model.js";
import { yupSignupValidation } from "./user.validation.js";
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
  // const ip4 = "100.42.20.0"

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
// const ipv4 = ip();
const ipv4 = "103.225.244.29"


// console.log(await loginIp(ipv4));

//check signup user and login user ip 

const signupUserIp = await User.findOne({email: userData.email})

// console.log(signupUserIp.device.query);
let message = "We noticed a login attempt to your account from a new device or location: "

//is new ip detected then store it 
const date = dayjs()




if(signupUserIp.device.query !== ipv4){
//if new ip then store it 
//with device details and user id 
const device = await loginIp(ipv4)

const data = {userId: user._id,device,date: date}
data.device.status = undefined
// console.log(await data);
//store it 
await Ip.create(data)
  // mail(signupUserIp.device.country,signupUserIp.device.city,signupUserIp.device.query,message, )
}

console.log("object");
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

export const updateName = async (req, res) => {
  const name = req.body;

  //update name

  const update = await User.updateMany(
    { email: req.userData.email },
    {
      $set: {
        firstName: name.firstName,
        lastName: name.lastName,
      },
    }
  );

  console.log("object");
};
