// import User from "../../user/user.model.js";
// import jwt from "jsonwebtoken";

// export const isBuyerPlus = async (req, res, next) => {
//   // const userToken = req.headers.authorization;

//   // if (!userToken) {
//   //   return res.status(404).json({ message: "User token not found. " });
//   // }

//   // //split token
//   // const splitToken = userToken.split(" ");

//   // const token = splitToken[1];
//   let token = req.cookies.token;

//   if (!token) {
//     return res.status(400).json({ message: "Somthing went wrong. " });
//   }

//   //decrypt token and find email

//   let payload;
//   try {
//     payload = jwt.verify(token, process.env.key);
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token." });
//   }

//   //check user existance for login as a user

//   const user = await User.findOne({ email: payload.email });

//   if (!user) {
//     return res.status(400).json({ message: "Unauthorized " });
//   }

//   //check is buyer
//   if (user.role !== "buyer") {
//     return res.status(400).json({ message: "Unauthorized " });
//   }
//   //only for subscription user
//   if (user.verifiedAs !== "plus") {
//     return res
//       .status(403)
//       .json({ message: "Access denied. Not a PLUS verified user." });
//   }

//   user.password = undefined;
//   user.device = undefined;

//   req.userId = user._id;
//   req.userData = user;
//   next();
// };
