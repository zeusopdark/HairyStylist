import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Please provide FullName"],
    },
    phoneNumber: {
        type: String,
        required: [true, "Please provide phone number"],
        unique: [true, "Please provide unique phone number"],
        validate: {
            validator: function (v) {
                return v.length === 12;
            },
            message: props => `${props.value} is not a valid phone number.`
        }
    },
    gender: {
        type: String
    },
    profilePic: {
        type: String
    },
    isBarber: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });
const User = mongoose.Model.Users || mongoose.model("User", UserSchema);
export default User;