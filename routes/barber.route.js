import { Router } from "express";
import { barberDetails, barberReviews, createBarberReview, deleteReview, findBarberById, findBarbersNearLocation, getAllBarbers } from "../controllers/barber.controller.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();

router.get("/getbarberbyid/:id", findBarberById);
router.get("/getallbarber", getAllBarbers);
router.get("/reviews", barberReviews);
router.post("/getnearestbarber", findBarbersNearLocation);
router.post("/barberdetails", barberDetails)
router.put("/review", verifyUser, createBarberReview);
router.delete("/deletereview", verifyUser, deleteReview);

export default router;