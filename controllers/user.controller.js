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
        const { phone, fullname } = req.body;
        // Checking if  phoneNumber already exists
        const p = phone.replace("+", "");
        console.log(p);
        const user = await User.findOne({ phoneNumber: p });
        if (user) {
            return res.status(400).json({ error: "Phone Number already exists." });
        }

        // Saving user to the database
        const newUser = new User({
            phoneNumber: p,
            fullname
        })
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error", err });
    }

}
export const loginUser = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        const checkPhone = phoneNumber.replace("+", "");
        const user = await User.findOne({ phoneNumber: checkPhone });
        if (!user) {
            return res.status(404).json({ message: "Phone number not registered.", success: false })
        }
        req.app.locals.id = user._id;
        req.app.locals.phone = phoneNumber
        console.log(req.app.locals.id);
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
            const token = jwt.sign({
                userId: req.app.locals.id,
            }, process.env.JWT_SECRET, { expiresIn: "24h" })
            console.log(token);

            res.cookie('token', token);
            return res.status(201).json({ message: "OTP verified successfully", success: true });
        }
        return res.status(400).json({ message: "Invalid OTP", success: false });
    } catch (err) {
        return res.status(500).json({ message: "Some error Occured", success: false });
    }
}
export const updateUser = (req, res, next) => {
    return res.status(200).json({ message: "Working" });
}