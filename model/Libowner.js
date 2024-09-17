import mongoose from 'mongoose';
const { Schema } = mongoose;

const LibownerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    firmname: {
        type: String,
        required: true,
        default: "Add Library Name"
    },
    contactnum: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true,
        default: "Add address of your library"
    },
    isallowed: {
        type: Boolean,
        default: false
    }
});

const Libowner = mongoose.model('libowner', LibownerSchema);
Libowner.createIndexes();

export default Libowner;