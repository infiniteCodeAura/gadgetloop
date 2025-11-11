import express from "express";
import userRouter from "./user/user.api.js";
import { connectDb } from "./dbConnect.js";
import buyerRouter from "./buyer/buyer.api.js";
import sellerRouter from "./seller/seller.api.js";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import cors from "cors";
import { cleanupOldCarts } from "./buyer/cart/auto.cart.flush.js";
import cookieParser from "cookie-parser";
import admin from "./admin/user/admin.user.api.js";
import path from "path";
import guestRouter from "./guest/guest.api.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());
app.use((err, req, res, next) => {
  err = err ? err.toString() : "Something went wrong.";
  return res.status(400).json({ message: err });
});

//limit  for ddos protectation
export const globalRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 400, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(globalRateLimiter);

// const allowedOrigins = ["http://192.168.0.106:5173","localhost:3000"];

app.use(
  cors({
    origin: [
      'http://192.168.0.106:3000',   // vite dev server
      'http://localhost:3000'  ,
       'http://localhost:3001'      // (optional) local dev
    ],
    credentials: true                // allow cookies + Authorization
  })
);

app.get("/hello",(req,res)=>{
  return res.send("hello");
})
 // Use this to allow all origins

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true); //allow request
//       } else {
//         callback(new Error("Not allowed by cors. ")); //reject request
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Optional but recommended
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

connectDb();
//run every midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running daily cart cleanup...");
  cleanupOldCarts();
});


// Serve uploads folder
app.use("/upload", express.static(path.join(process.cwd(), "upload")));




//user
app.use("/api/v0",guestRouter)
app.use("/api/v1", userRouter);
app.use("/api/v2", sellerRouter);
app.use("/api/v3", buyerRouter);



//admin

app.use("/api/admin/v1", admin);

const port = process.env.port || 8888;
app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});
