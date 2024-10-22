import mongoose from 'mongoose';
const { Schema } = mongoose;

const ResultSchema = new Schema({
    papername: {
        type: String,
        required: true
    },
    appname: {
        type: String,
        required: true
    },
    formlink: {
        type: String,
        required: true,
        unique: true
    },
    youtubelink: {
        type: String,
        required: true,
        unique: true
    },
    endformdate: {
        type: Date,
        required: true,
        get: (endformdate) => endformdate.getTime(),
        set: (endformdate) => new Date(endformdate)
    }
});

const Result = mongoose.model('result', ResultSchema);
Result.createIndexes();

export default Result;