import jwt from "jsonwebtoken"
export const verifyUser = (req, res, next) => {

    const token = req.cookies.token;

    if (!token || token === undefined) {
        return res.status(403).json({ message: "No cookie, authorization failed" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.id = decodedToken.userId;

        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid cookie" });
    }
};