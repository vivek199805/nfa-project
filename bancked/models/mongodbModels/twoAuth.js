// models/Otp.js
import mongoose from "mongoose";

const twoAuthSchema = new mongoose.Schema({
  userId: {
    type: String, // reference to User collection
    required: true,
  },
  email: {
    type: String,
    required: false, // optional if using phone
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: false, // optional if using email
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Number,
    default: 0
  },
  otpExpiry: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

twoAuthSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const Twoauth = new mongoose.model("Twoauth", twoAuthSchema);

export default Twoauth;
