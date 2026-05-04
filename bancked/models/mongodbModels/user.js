import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pinCode: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    usertype: { type: String, required: true },
    password: {
      type: String,
      required: true,
      //  select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    },
  },
  { timestamps: true }
);

const User = new mongoose.model("User", userSchema);

export default User;
