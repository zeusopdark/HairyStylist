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
    location: {
        type: {
            type: String,
            enum: ['Point'], // Only accept 'Point' as the value
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers [longitude, latitude]
            required: true
        }
    },
    gender: {
        type: String
    },
    profilePic: {
        type: String
    },
    email: {
        type: String,
        unique: [true, "Please provide the correct email"],
        required: true
    },
    address: {
        type: String
    }

}, { timestamps: true });
const User = mongoose.Model.Users || mongoose.model("User", UserSchema);
export default User;