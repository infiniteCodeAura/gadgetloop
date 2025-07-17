import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    required: true,
  },

kycData:[
    {
        _id: false,

        firstName: {
            type:String,
            required: true,
            trim:true
        },
         lastName: {
            type:String,
            required: true,
            trim:true
        },
         email: {
            type:String,
            required: true,
            trim:true
        },
        address: {
            type:String,
            required:true,
            trim:true
        },
        simOwner:{
            type:String,
            required:true,
        },
        ppImage:{
            type:String,
            
        }

    }
]



},{
    timestamps:true
});

const Kyc = mongoose.model("kyc",kycSchema)
export default Kyc;