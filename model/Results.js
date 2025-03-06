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
        required: true
    },
    youtubelink: {
        type: String,
        default: ""
    },
    endformdate: {
        type: Date,
        default: Date.now
    }
});

const Result = mongoose.model('result', ResultSchema);
Result.createIndexes();

export default Result;