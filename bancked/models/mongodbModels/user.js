import mongoose from "mongoose";
// import jwt from 'jsonwebtoken'
import { hashPassword } from "../../utils/hashPassword.js";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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
    //  tokens:[{
    //   token:{
    //     type:String,
    //     required: true
    //   }
    //  }]
  },
  { timestamps: true }
);

// userSchema.methods.toJSON = async function(){
//   const user = this
//  const  userObject = user.toObject();
//  delete userObject.password
// delete userObject.tokens
//   return userObject;
// }

// userSchema.methods.genarateAuthToken= async function(){
//     const user = this
//    const token = jwt.sign({_id:user._id.toString()},  process.env.JWT_SECRET);
//    user.tokens = user.tokens.concact({token});
//    await user.save()
//     return token;
// }

// userSchema.statics.findByCredentails = async (email, password) =>{
//     const user = await User.find({email})

//     if(!user){
//       throw new Error("Unable to login")
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if(!isMatch){
//       throw new Error("Unable to login")
//     }

//     return user;
// }

// // HASH PASSWORD BEFORE SAVE
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await hashPassword(this.password);
//   next();
// });

// //  Virtual field (optional but useful)
// userSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

// collection creation

const User = new mongoose.model("User", userSchema);

export default User;
