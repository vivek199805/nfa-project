const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    name : {
     type: String,   
     },
     seq:{
      type:Number
     }
  });
// collection creation

 const Counter = new mongoose.model("Counter", counterSchema );
module.exports = Counter;
