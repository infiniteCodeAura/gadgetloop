import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 1000,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // createdAt & updatedAt
    }
);

export const Contact = mongoose.model("Contact", contactSchema);
