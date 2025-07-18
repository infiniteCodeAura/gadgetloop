import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
    },
    code: {
      type: String,
    },

    role: {
      type: String,
      trim: true,
      required: true,
      default: "buyer",
      enum: ["seller", "buyer", "invalid role"],
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    verifiedAs: {
      type: String,
      enum: ["basic", "pro", "ultimate"],
      default: "basic",
      required: true,
    },
    device: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);
export default User;
