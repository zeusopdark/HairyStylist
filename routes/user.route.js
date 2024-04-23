import { Router } from "express";
import { generateOtp, getUserDetails, loginUser, registerUser, updateUser, verifyOTP } from "../controllers/user.controller.js";
import { localVairables } from "../middlewares/localVariables.js";
import { verifyUser } from "../middlewares/verifyUser.js";
const router = Router();


router.get("/getUser/:id", getUserDetails);

router.get("/verifyotp", verifyOTP)

router.get("/generateotp", generateOtp);

router.post("/register", registerUser);

router.post("/login", localVairables, loginUser);

router.put("/updateUser", verifyUser, updateUser);

export default router;