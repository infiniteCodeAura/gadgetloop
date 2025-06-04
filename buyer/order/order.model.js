import { min } from "moment";
import mongoose, { mongo } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          min: 0
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: 'processing',
      required: true,
    },

    shippingAddress: {
      fullName: String,
      phone: String,
      address1: String,
      address2: String,
      gharNumber: String,
    },
    statusHistory:[
      {
        status: {
          type:String,
          enum: ['processing','shipped','delivered','cancelled'],
        },
        updatedAt :{
          type: Date,
          default: Date.now
        },
      }
    ],
    deliveredAt: {
      type: Date,
    },
    isArchive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("order", orderSchema);
