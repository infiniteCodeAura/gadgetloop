import dayjs from "dayjs";
import User from "../../user/user.model.js";
import { Cart } from "./cart.model.js";

export const cleanupOldCarts = async () => {
  //get cart data for auto flush functionality

  const now = dayjs();

  try {
    const users = await User.find();
    const carts = await Cart.find();

   



    
  } catch (error) {
    return console.log(error);
  }
};
