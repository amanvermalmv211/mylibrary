import mongoose from 'mongoose';
const { Schema } = mongoose;

const ResultSchema = new Schema({
    papername: {
        type: String,
        required: true
    },
    formlink: {
        type: String,
        required: true,
        unique: true
    },
    youlink: {
        type: String,
        required: true,
        unique: true
    },
    tubelink: {
        type: String,
        required: true,
        unique: true
    },
    checklink: {
        type: String,
        required: true,
        unique: true
    },
    formdate: {
        type: Date,
        default: Date.now,
        required: true,
        get: (formdate) => formdate.getTime(),
        set: (formdate) => new Date(formdate)
    },
    endformdate: {
        type: Date,
        required: true
    },
    expirydate: {
        type: String,
        required: true
    }
});

const Result = mongoose.model('result', ResultSchema);
Result.createIndexes();

export default Result;