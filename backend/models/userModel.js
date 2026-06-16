import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        default: true
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/dnw2jkrto/image/upload/q_auto/f_auto/v1781596342/default_vntuy8.png'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        default: ""
    }
})

const User = mongoose.model("User", UserSchema);

export default User;