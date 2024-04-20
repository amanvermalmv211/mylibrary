import mongoose from 'mongoose';
const {Schema} = mongoose;

const OTPSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    otp:{
        type: String,
        required: true
    },
    timestamp:{
        type: Date,
        default: Date.now,
        require: true,
        get: (timestamp) => timestamp.getTime(),
        set: (timestamp) => new Date(timestamp)
    }
});

const OTPVerification = mongoose.model('otp', OTPSchema);
OTPVerification.createIndexes();

export default OTPVerification;