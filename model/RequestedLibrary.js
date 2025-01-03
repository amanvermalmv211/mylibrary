import mongoose from 'mongoose';
const { Schema } = mongoose;

const RequestedLibrary = new Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    libraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Libowner',
        required: true,
    },
    requestDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
});

const Student = mongoose.model('Requestedlibrary', StudentSchema);
Student.createIndexes();

export default RequestedLibrary;