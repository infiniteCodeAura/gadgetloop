import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    unique:true,
    trim: true,
    lowercase:true
  },
  password: {
    type: String,
    required: true,
  },
profile: {
  type: String,
},

  role: {
    type: String,
    trim: true,
    required: true,
    default: "buyer",
    enum: ["seller", "buyer", "invalid role"],
  },
  device: {
    type: Object,
    required: false,
  },
},{
  timestamps:true

});

const User = mongoose.model("user", userSchema);
export default User;
