import express from "express";
import userRouter from "./user/user.api.js";
import { connectDb } from "./dbConnect.js";
import buyerRouter from "./buyer/buyer.api.js";
import sellerRouter from "./seller/seller.api.js";

const app = express();

app.use(express.json());

app.use((err, req, res, next) => {
  err = err ? err.toString() : "Something went wrong.";
  return res.status(400).json({ message: err });
});
connectDb()
 
app.use("/api/v1",userRouter)
app.use("/api/v2",sellerRouter)
app.use("/api/v3",buyerRouter)




const port = process.env.port || 8888;
app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});
