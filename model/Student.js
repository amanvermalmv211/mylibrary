import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileImg: {
        type: String,
        default: '0'
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
        required: true
    },
    isReadTAC: {
        type: Boolean,
        required: true,
        default: false
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
                get: (subscriptionDate) => subscriptionDate.getTime(),
                set: (subscriptionDate) => new Date(subscriptionDate)
            },
            expiryDate: {
                type: Date,
                require: true,
                get: (expiryDate) => expiryDate.getTime(),
                set: (expiryDate) => new Date(expiryDate)
            },
            blocked: {
                type: Boolean,
                default: false
            },
            emailSentDate: {
                type: Date,
                default: null
            }
        }],
        default: [],
    },
});

const Student = mongoose.model('Student', StudentSchema);
Student.createIndexes();

export default Student;