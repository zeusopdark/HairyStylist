import { Router } from "express";
import { barberDetails, findBarbersNearLocation } from "../controllers/barber.controller.js";

const router = Router();

router.post("/getnearestbarber", findBarbersNearLocation);
router.post("/barberdetails", barberDetails)

export default router;