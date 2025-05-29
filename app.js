import express from "express";
import userRouter from "./user/user.api.js";
import { connectDb } from "./dbConnect.js";
import buyerRouter from "./buyer/buyer.api.js";
import sellerRouter from "./seller/seller.api.js";
import rateLimit from "express-rate-limit";
import cron from 'node-cron';
import { cleanupOldCarts } from "./buyer/cart/auto.cart.flush.js";
const app = express();

app.use(express.json());

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
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use(globalRateLimiter)

connectDb()
//run every midnight
cron.schedule("0 0 * * *", () => {
  console.log("🕛 Running daily cart cleanup...");
  cleanupOldCarts();
});


app.use("/api/v1",userRouter)
app.use("/api/v2",sellerRouter)
app.use("/api/v3",buyerRouter)





const port = process.env.port || 8888;
app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});
