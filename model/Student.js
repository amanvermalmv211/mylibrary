import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    profileImg: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
    },
    pin: {
        type: Number,
        required: true
    },
    contactnum: {
        type: Number,
        required: true
    },
    subscriptionDetails: {
        type: [{
            libraryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Libowner',
                required: true,
            },
            idxFloor: {
                type: Date,
                default: Date.now,
            },
            idxShift: {
                type: Date,
                default: Date.now,
            },
            idxSeatSelected: {
                type: Date,
                default: Date.now,
            },
            priceDetails: {
                type: Date,
                default: Date.now,
            },
            subscriptionDate: {
                type: Date,
                default: Date.now,
            },
            expiryDate: {
                type: Date,
                required: true,
            },
        }],
        default: [],
    },
});

const Student = mongoose.model('Student', StudentSchema);
Student.createIndexes();

export default Student;