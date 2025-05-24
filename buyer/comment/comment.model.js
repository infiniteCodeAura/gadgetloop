// models/Comment.js

import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firstName: {
        type:String,
        required:true,
        trim:true,
        ref:"User"
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    star: {
      type: Number,
      min: 1,
      max: 5,
      default:3
    },
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        firstName:{
            type:String,
            
        },
        reply: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Comment = mongoose.model('comment', commentSchema);
