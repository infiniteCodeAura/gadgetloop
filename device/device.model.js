import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    trim: true,
  },
  data: {
    type:Object,
    required:false
  }
});

const Ip = mongoose.model("ip",deviceSchema);
export default Ip;

