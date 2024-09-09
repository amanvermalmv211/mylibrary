import mongoose from 'mongoose';
const {Schema} = mongoose;

const AdminSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name:{
        type: String,
        required: true
    }
});

const Admin = mongoose.model('admin', AdminSchema);
Admin.createIndexes();

export default Admin;