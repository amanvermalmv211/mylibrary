import mongoose from 'mongoose';
const { Schema } = mongoose;

const EditorSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    contactnum: {
        type: Number,
        required: true
    },
    isallowed: {
        type: Boolean,
        default: false
    }
});

const Editor = mongoose.model('editor', EditorSchema);
Editor.createIndexes();

export default Editor;