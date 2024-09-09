import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    contactnum: {
        type: Number
    },
    emergencycontactnum: {
        type: Number
    },
    address: {
        type: String
    },
    issubscribed:{
        type: Boolean,
        default: false
    }
});

const Student = mongoose.model('student', StudentSchema);
Student.createIndexes();

export default Student;