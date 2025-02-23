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
    localarea: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    contactnum: {
        type: Number,
        required: true
    },
    aadharnum: {
        type: Number,
        required: true,
        default: 0
    },
    subscriptionDetails: {
        type: [{
            libraryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Libowner',
                required: true,
            },
            idxFloor: {
                type: Number,
                required: true,
            },
            idxShift: {
                type: Number,
                required: true,
            },
            idxSeatSelected: {
                type: Number,
                required: true,
            },
            priceDetails: {
                type: String,
                required: true,
            },
            subscriptionDate: {
                type: Date,
                default: Date.now,
                require: true,
                get: (timestamp) => timestamp.getTime(),
                set: (timestamp) => new Date(timestamp)
            },
            expiryDate: {
                type: Date,
                require: true,
                get: (timestamp) => timestamp.getTime(),
                set: (timestamp) => new Date(timestamp)
            },
        }],
        default: [],
    },
});

const Student = mongoose.model('Student', StudentSchema);
Student.createIndexes();

export default Student;