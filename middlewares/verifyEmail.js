import User from "../model/user.model.js";
export const verifyEmail = async (req, res, next) => {
    try {
        // Extract email from request body or in another case from query
        const { email } = req.body;

        // Checking if email is provided
        if (!email) {
            return res.status(400).json({ message: "Email required...!", success: false });
        }

        // Finding user by email in the database
        const user = await User.findOne({ email }).select("-password");

        // If user not found, return error
        if (!user) {
            return res.status(404).json({ message: "Email not found", success: false });
        }

        // Attaching user's ID to request object
        req.userId = user._id;

        // Proceeding to the next middleware
        next();
    }
    catch (err) {
        // If an error occurs, returning internal server error
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};
export const localVairables = (req, res, next) => {
    req.app.locals = {
        otp: null,
        resetSession: false
    }
    next();
}