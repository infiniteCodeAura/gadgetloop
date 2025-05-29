import dayjs from "dayjs";
import User from "../../user/user.model.js";
import { Cart } from "./cart.model.js";
import mailCartWarning from "../../authMailer/cart.warning.mail.js";

export const cleanupOldCarts = async () => {
  const now = dayjs().startOf("day"); // Use startOf("day") to ignore time differences

  try {
    const carts = await Cart.find();

    for (const cart of carts) {
      if (!Array.isArray(cart.items) || cart.items.length === 0) continue;

      // Arrays to track warning items and items to delete
      const itemsToWarn = [];
      const itemsToDelete = [];
      const updatedItems = [];

      // Loop through each item in cart
      for (const item of cart.items) {
        const createdDate = dayjs(item.createdAt).startOf("day");
        const ageInDays = now.diff(createdDate, "day");

        if (ageInDays === 10) {
          // Item is exactly 10 days old → add to warning list
          itemsToWarn.push(item);
        }

        if (ageInDays >= 15) {
          // Item is 15 or more days old → add to deletion list (do NOT keep in updatedItems)
          itemsToDelete.push(item);
          continue; // Skip pushing to updatedItems (means deleting this item)
        }

        // Item is not expired → keep in updatedItems
        updatedItems.push(item);
      }

      // Fetch user data for this cart's owner
      const user = await User.findById(cart.userId);
      if (!user) continue;

      // Send warning email if any items are 10 days old
      if (itemsToWarn.length > 0) {
        const productList = itemsToWarn
          .map((item) => `- ${item.productName || item.productId}`) // Format product list nicely
          .join("\n");

        const warningMessage = `
Hello ${user.firstName},

We wanted to remind you that the following item(s) in your cart have been inactive for 10 days:

${productList}

Please note these items will be automatically removed from your cart in 5 days if no action is taken.

Complete your purchase soon to avoid losing them!
        `;

        // console.log(`Sending warning email to ${user.email} for cart ${cart._id}`);
        await mailCartWarning(user.email, warningMessage);
      }

      // Delete expired items and send removal email if any items are 15 days or older
      if (itemsToDelete.length > 0) {
        // Update the cart items in DB with only non-expired items
        await Cart.updateOne({ _id: cart._id }, { $set: { items: updatedItems } });

        const deletedProductList = itemsToDelete
          .map((item) => `- ${item.productName || item.productId}`)
          .join("\n");

        const removalMessage = `
Hello ${user.firstName},

We wanted to inform you that due to inactivity of 15 days or more, the following items were removed from your cart:

https://gadgetloop.com/${deletedProductList}

Thank you for understanding.
        `;

        // console.log(`Sending removal email to ${user.email} for cart ${cart._id}`);
        await mailCartWarning(user.email, removalMessage);
      }
    }
  } catch (error) {
    console.error("Error in cleanupOldCarts:", error);
  }
};
