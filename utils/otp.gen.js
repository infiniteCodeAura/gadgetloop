
import { totp } from "otplib";

const secret = process.env.otpKey

export const otpGen = async()=>{
let otp ;
    try {
       totp.options = {step:0.001}
   const token = await totp.generate(secret)
   otp = token;
        
    } catch (error) {
        console.log(error)
    }

return otp




}