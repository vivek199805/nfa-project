import Counter from '../models/counter.js';

async function generateCounter(nameVal) {
    let count = await Counter.findOneAndUpdate(
        { name: nameVal },
        { $inc: { seq: 1 } },
        { new: true }
    );

    if (count == null) {
        const counter = new Counter({
            name: nameVal,
            seq: 1
        });
        count = await counter.save();
    }

    return count.seq;
}

export default generateCounter;