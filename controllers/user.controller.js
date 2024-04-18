import User from "../model/user.model.js";
import otpgenerator from "otp-generator"
import sendEmail from "./mailer.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"

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
        const { fullname, password, email } = req.body;

        // Checking if  email already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "Email already exists." });
        }

        // Check if password exists in the request body
        if (!password) {
            return res.status(400).json({ error: "Password is required." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            email,
            password: hashedPassword,
            fullname
        });

        // Save user to the database
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });

        // If email doesn't exist or password is incorrect
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({
            userId: user._id,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "24h" })
        console.log(token);

        res.cookie('token', token);
        const { password: something, ...rest } = user._doc;
        // User authenticated successfully
        return res.status(200).json({ message: "Login successful", rest, success: true, token });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const generateOtp = async (req, res, next) => {
    req.app.locals.otp = otpgenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    req.app.locals.resetSession = true;
    res.status(201).send({ code: req.app.locals.otp, success: true });
}

export const verifyOTP = async (req, res, next) => {
    const { code } = req.query;
    if (parseInt(req.app.locals.otp) === parseInt(code)) {
        return res.status(201).json({ message: "OTP verified successfully", success: true });
    }
    return res.status(400).json({ message: "Invalid OTP", success: false });
}

export const sendMail = async (req, res, next) => {
    const { email, text, subject } = req.body;
    await sendEmail(email, text || "Something went wrong ...!", subject || "Password Recovery.")
    res.status(200).json({ success: true });
}

export const checkSession = async (req, res, next) => {
    const flag = req.app.locals.resetSession;
    if (flag) {
        return res.status(201).json({ msg: "access granted", success: true, flag })
    }
    return res.status(400).json({ error: "Session expired", flag: false })
}

export const resetpassword = async (req, res, next) => {
    try {
        if (!req.app.locals.resetSession) return res.status(440).json({ error: "Session Expired" })
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Failed", error: "Invalid username" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword;
        await user.save();
        req.app.locals.resetSession = false;
        return res.status(200).json({ message: "Password reset successful", success: true });
    } catch (err) {
        console.error("Error in resetPassword:", err);
        return res.status(500).json({ message: "Failed to reset password", error: err.message });
    }
}

export const updateUser = (req, res, next) => {

}