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
    type: Number,
    required: false,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

 const Twoauth = new mongoose.model("Twoauth", twoAuthSchema);

 export default Twoauth;
