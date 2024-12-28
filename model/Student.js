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
    requestedLibraries: {
        type: [{
            libraryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Libowner', // Reference to the library schema
                required: true,
            },
            requestDate: {
                type: Date,
                default: Date.now, // Defaults to the current date
            },
            status: {
                type: String,
                enum: ['Pending', 'Approved', 'Rejected'],
                default: 'Pending', // Default status for new requests
            },
        }],
        default: [], // Default to an empty array
    },
    subscriptionDetails: {
        type: [{
            libraryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Libowner',
                required: true,
            },
            subscriptionDate: {
                type: Date,
                default: Date.now, // Defaults to the current date
            },
            expiryDate: {
                type: Date,
                required: true,
            },
        }],
        default: [], // Default to an empty array
    },
});

const Student = mongoose.model('student', StudentSchema);
Student.createIndexes();

export default Student;