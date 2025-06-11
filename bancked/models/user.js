 const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
 const userSchema = new mongoose.Schema({
  _id : {
    type: Number,   
},
   email : {
       type: String,
       unique: true      
   },
   name : {
    type: String,
   
},
 phone : {
  type: String,   
  },
 status : {
  type: String, 
},
 role : {
  type: String,  
  },
   password : {
       type: String,
   },
   tokens:[{
    token:{
      type:String,
      required: true
    }
   }]
});


userSchema.virtual("Tasks", {
  'ref': 'Task' ,// other Model name 
   'localField': '_id',
   foreignField: 'owner' // other Model field name
})

userSchema.methods.toJSON = async function(){
  const user = this
 const  userObject = user.toObject();
 delete userObject.password
delete userObject.tokens
  return userObject;
}

userSchema.methods.genarateAuthToken= async function(){
    const user = this
   const token = jwt.sign({_id:user._id.toString()},  'thisisnewproject');
   user.tokens = user.tokens.concact({token});
   await user.save()
    return token;
}

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
//     user.password = await bcrypt.hash(user.password, 8)
//   }

//   next()
// })

// collection creation

  const User = new mongoose.model("User", userSchema );

 module.exports = User;

