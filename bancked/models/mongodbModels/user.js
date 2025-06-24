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
    category: { type: String, required: true },
    password: { 
      type: String, 
      required: true,
      //  select: false 
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
// Hash the plain text password before saving
// userSchema.pre('save', async function(next){
//   const user = this

//   if(user.isModified){
//     user.password = await hashPassword(password);
//   }

//   next()
// })

// collection creation

const User = new mongoose.model("User", userSchema);

export default User;
