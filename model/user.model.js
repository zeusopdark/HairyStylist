import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Please provide FullName"],
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, "Please provide a unique email"],
        unique: true
    },
    phoneNumber: {
        type: Number
    },
    gender: {
        type: String
    }
});
const User = mongoose.Model.Users || mongoose.model("User", UserSchema);
export default User;