import mongoose from 'mongoose';
const { Schema } = mongoose;

const LibownerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    profileImg: {
        type: Number,
        default: 0
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
        default: null
    },
    localarea: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    googlemap: {
        type: String,
        default: null
    },
    shifts: {
        type: [{
            stTime: { type: String, default: '7' },
            endTime: { type: String, default: '12' },
            price: { type: Number, default: 700 },
            discountPrice: { type: Number, default: 500 },
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
            stTime: '7',
            endTime: '12',
            price: 700,
            discountPrice: 500,
            numberOfSeats: Array(80).fill({
                student: null,
                gender: 'boy',
                isBooked: false
            })
        },
        {
            stTime: '12',
            endTime: '17',
            price: 1000,
            discountPrice: 700,
            numberOfSeats: Array(80).fill({
                student: null,
                gender: 'boy',
                isBooked: false
            })
        },
        {
            stTime: '17',
            endTime: '21',
            price: 800,
            discountPrice: 600,
            numberOfSeats: Array(80).fill({
                student: null,
                gender: 'boy',
                isBooked: false
            })
        }]
    },
    isallowed: {
        type: Boolean,
        default: false
    }
});

const Libowner = mongoose.model('libowner', LibownerSchema);
Libowner.createIndexes();

export default Libowner;