import mongoose from 'mongoose';
const { Schema } = mongoose;

const LibownerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    ownername: {
        type: String,
        required: true
    },
    libname: {
        type: String,
        default: null
    },
    contactnum: {
        type: Number,
        required: true
    },
    libcontactnum: {
        type: Number,
        default: null
    },
    aadharnum: {
        type: Number,
        required: true
    },
    localarea: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    pin: {
        type: String,
        default: null
    },
    googlemap: {
        type: String,
        default: null
    },
    shifts: {
        type: [{
            shiftTime: { type: String, default: '9:00 AM - 5:00 PM' },
            bookingPrice: { type: Number, default: 500 },
            // Default 80 seats per shift
            numberOfSeats: {
                type: [{
                    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
                    gender: { type: String, default: 'boy', required: true },
                    isBooked: { type: Boolean, default: false }
                }],
                default: Array(80).fill({
                    student: null,
                    gender: 'boy',
                    isBooked: false
                })
            }
        }],
        default: [{
            shiftTime: '9:00 AM - 5:00 PM',
            bookingPrice: 500,
            numberOfSeats: Array(80).fill({
                student: null,
                gender: 'boy',
                isBooked: false
            })
        }]
    },
    isallowed: {
        type: Boolean,
        required: true,
        default: false
    }
});

const Libowner = mongoose.model('libowner', LibownerSchema);
Libowner.createIndexes();

export default Libowner;