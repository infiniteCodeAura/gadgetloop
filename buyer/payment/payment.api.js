import express from "express";


import { isUser } from "../../authentication/user.authentication.js";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "./payment.service.js";

const router = express.Router();

router.post("/payment/khalti/initiate", isUser, initiateKhaltiPayment);
router.post("/payment/khalti/verify", isUser, verifyKhaltiPayment);

export default router;
