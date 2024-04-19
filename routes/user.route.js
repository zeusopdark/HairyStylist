import { Router } from "express";
import { checkSession, generateOtp, getUserDetails, loginUser, registerUser, resetpassword, sendMail, updateUser, verifyOTP } from "../controllers/user.controller.js";
import { localVairables, verifyEmail } from "../middlewares/verifyEmail.js";
import { verifyUser } from "../middlewares/verifyUser.js";
const router = Router();


router.get("/getUser/:id", getUserDetails);

router.get("/verifyotp", verifyOTP)

router.get("/session", checkSession);

router.post("/generateotp", localVairables, verifyEmail, generateOtp);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/registermail", verifyEmail, sendMail);

router.put("/updateUser", verifyUser, updateUser);

router.put("/resetpassword", resetpassword);

export default router;