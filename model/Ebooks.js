import mongoose from 'mongoose';
const { Schema } = mongoose;

const EbookSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    authname: {
        type: String,
        required: true
    },
    published: {
        type: String,
        required: true
    },
    ebooklink : {
        type: String,
        required: true,
        unique: true
    }
});

const Ebook = mongoose.model('ebook', EbookSchema);
Ebook.createIndexes();

export default Ebook;