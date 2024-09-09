import mongoose from 'mongoose';
const {Schema} = mongoose;

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    isverified:{
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('user', UserSchema);
User.createIndexes();

export default User;