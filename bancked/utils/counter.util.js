const Counter = require('../models/counter');
const { waitUntil } = require('async-wait-until');

 async function generateCounter(nameVal) {
    let seqId = -1;
    Counter.findOneAndUpdate({ name: nameVal },{ $inc: { seq: 1 } },{ new: true},(error, count) => {
     if(count == null){
        const counter = new Counter({
            name:nameVal,
            seq:1
        })
        counter.save();
        seqId = 1
     }else{
        seqId= count.seq;
     }
    });
    await waitUntil(() => seqId != -1);
      return seqId;
 }

 module.exports = generateCounter;