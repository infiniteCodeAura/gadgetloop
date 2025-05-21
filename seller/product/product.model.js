import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      maxlength: 30,
      minlength: 2,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 2000,
      trim: true,
      required: true,
    },

    price: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 15,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },

    productOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    images: {
      type: [String],
      default:[],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);