import { Router } from "express";
import { barberReviews, createBarberReview, deleteReview, findBarberById, findBarbersNearLocation, generateOtp, getAllBarbers, loginBarber, registerBarber, verifyOTP } from "../controllers/barber.controller.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();

router.get("/verifyotp", verifyOTP);
router.get("/generateotp", generateOtp);
router.get("/getbarberbyid/:id", findBarberById);
router.get("/getallbarber", getAllBarbers);
router.get("/reviews", barberReviews);
router.post("/getnearestbarber", findBarbersNearLocation);
router.post("/loginbarber", loginBarber);
router.post("/registerbarber", registerBarber);
router.put("/review", verifyUser, createBarberReview);
router.delete("/deletereview", verifyUser, deleteReview);

export default router;