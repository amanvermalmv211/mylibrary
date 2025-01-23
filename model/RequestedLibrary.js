import mongoose from 'mongoose';
const { Schema } = mongoose;

const RequestedLibrarySchema = new Schema({
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
    requestDate: {
        type: Date,
        default: Date.now,
        require: true,
        get: (requestDate) => requestDate.getTime(),
        set: (requestDate) => new Date(requestDate)
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
});

const RequestedLibrary = mongoose.model('Requestedlibrary', RequestedLibrarySchema);
RequestedLibrary.createIndexes();

export default RequestedLibrary;