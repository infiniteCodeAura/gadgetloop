import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    trim: true,
  },
  
  device:{
    type: Object,

  },
  date: {
    type: String,

  },

});

const Ip = mongoose.model("ip",deviceSchema);
export default Ip;

