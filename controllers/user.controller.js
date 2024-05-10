import User from "../model/user.model.js";
import otpgenerator from "otp-generator"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
// import bcrypt from "bcrypt"

export const getUserDetails = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Id not provided", success: false });
    }
    //verify valid mongoId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid user ID" });
    }
    try {
        const user = await User.findById(id).select("-password");
        return res.status(200).json({ message: "User fetched Successfully", success: true, user });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", success: false, err });
    }
}
export const registerUser = async (req, res, next) => {
    try {
        // Checking if phoneNumber exists in req.app.locals
        const phoneNumber = req.app.locals.phone;
        if (!phoneNumber) {
            return res.status(401).json({ error: "Please login first.", success: false });
        }
        const phone = phoneNumber.replace("+", "");
        // Creating an object with required fields and their values
        const userFields = {
            fullname: req.body.fullname,
            phoneNumber: phone,
            email: req.body.email
        };

        // Adding optional fields if provided in the request body
        if (req.body.gender) {
            userFields.gender = req.body.gender;
        }
        if (req.body.profilePic) {
            userFields.profilePic = req.body.profilePic;
        }
        if (req.body.address) {
            userFields.address = req.body.address;
        }

        // Creating a new user instance with the combined fields
        const newUser = new User(userFields);

        // Saving the new user to the database
        const user = await newUser.save();
        const token = jwt.sign({
            userId: user._id,
        }, process.env.JWT_SECRET, { expiresIn: "24h" })

        res.cookie('token', token);

        return res.status(201).json({ message: "User registered successfully.", success: true, token });

    } catch (err) {
        console.error("Error:", err);
        return res.status(422).json({ error: "Internal Server Error", err });
    }

}

export const loginUser = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ message: "Phone number required", success: false });
        req.app.locals.phone = phoneNumber

        return res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, err })
    }
}
export const generateOtp = async (req, res, next) => {
    const phoneNumber = req.app.locals.phone
    const OTP = otpgenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    const options = {
        phone: phoneNumber,
        otp: OTP
    }
    req.app.locals.otp = OTP
    const phone = options.phone.replace("+", "");
    try {
        const url = `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?dr=false&sender=FRICOZ&recipient=${phone}&msg=Dear Customer, Your OTP for mobile number verification is ${options.otp}. Please do not share this OTP to anyone - Firstricoz Pvt. Ltd.&user=FIRSTR&pswd=First^01&PE_ID=1601832170235925649&Template_ID=1607100000000306120`;
        const response = await fetch(url);
        res.status(200).send("OTP sent succssfully");
    } catch (err) {
        res.status(500).json({ message: "Internal server Error unable to generate OTP", success: false })
    }
}
export const verifyOTP = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (parseInt(req.app.locals.otp) === parseInt(code)) {
            const phone = req.app.locals.phone;
            const p = phone.replace("+", "");
            const user = await User.findOne({ phoneNumber: p });
            if (!user) {
                return res.status(200).json({ message: "Register Please...!", success: false });
            }
            const token = jwt.sign({
                userId: user._id,
            }, process.env.JWT_SECRET, { expiresIn: "24h" })

            res.cookie('token', token);
            return res.status(201).json({ message: "OTP verified successfully User Logged in successful", success: true, token });
        }
        return res.status(400).json({ message: "Invalid OTP", success: false });
    } catch (err) {
        return res.status(500).json({ message: "Some error Occured", success: false });
    }
}
export const updateUser = (req, res, next) => {
    return res.status(200).json({ message: "Working" });
}