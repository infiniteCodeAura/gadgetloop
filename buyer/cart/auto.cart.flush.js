import dayjs from "dayjs";
import { Cart } from "./cart.model.js";

export const cleanupOldCarts = async()=>{

//get cart data for auto flush functionality 
const cart = await Cart.find({createdAt})

const now = dayjs();
   const tenDayAgo = now.subtract(10, "day")
   const fifteenDayAgo = now.subtract(15, "day");

   try {
    const warningCarts = await Cart.find({
        createdAt: {
            $lte:tenDayAgo.toDate(),
            $gt: fifteenDayAgo.toDate(),
        }
    })

    const result = await Cart.deleteMany({
        createdAt:{
            $lte: fifteenDayAgo.toDate()
        }
    })


   } catch (error) {
    
   }


}

