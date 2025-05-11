import bcrypt from "bcrypt";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import yup from "yup";
import { publicIpv4 } from "public-ip";
import { loginIp } from "../device/device.data.js";
import Ip from "../device/device.model.js";

import User from "./user.model.js";
import { yupSignupValidation } from "./user.validation.js";
import { mail } from "../authMailer/login.validation.mail.js";

export const signupUserValidation = async (req, res, next) => {
  try {
    const userSignupData = req.body;
    await yupSignupValidation.validate(userSignupData, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const signupUser = async (req, res) => {
  const userData = req.body;

  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exist with this email." });
    }

    // Get public IP address
    const ip4 = await publicIpv4();
    let device;

    try {
      const url = `http://ip-api.com/json/${ip4}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(400).json({ message: "Something went wrong while fetching device info." });
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

export const loginUser = async (req, res) => {
  const userData = req.body;

  try {
    const user = await User.findOne({ email: userData.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(userData.password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const ipv4 = await publicIpv4();
    const signupUserIp = await User.findOne({ email: userData.email });

    let message = "We noticed a login attempt to your account from a new device or location: ";
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

      mail(user.firstName,device.country, device.city, device.query, message,user.email, date)
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.key,
      { expiresIn: "24h" }
    );

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.device;

    return res.status(200).json({ data: sanitizedUser, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

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

export const updateName = async (req, res) => {
  const name = req.body;

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
