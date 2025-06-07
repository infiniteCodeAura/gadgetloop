import mongoose, { mongo } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId :{
      type: String,
      required: true
    },
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
      default: "cod",
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
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address1: { type: String, default: '' },
  address2: { type: String, default: '' },
  gharNumber: { type: String, default: '' },
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
