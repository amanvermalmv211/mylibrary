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
    address: {
        type: String,
        required: true
    },
    contactnum: {
        type: Number,
        required: true
    },
    libDetail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Libowner',
        default: null
    },
    shift: {
        type: Number,
        default: null
    },
    seat: {
        type: Number,
        default: null
    },
    issubscribed:{
        type: Boolean,
        default: false
    }
});

const Student = mongoose.model('student', StudentSchema);
Student.createIndexes();

export default Student;