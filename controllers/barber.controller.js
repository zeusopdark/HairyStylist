import mongoose from "mongoose";
import { geocodeAddress } from "../helper/map.js";
import Barber from "../model/barber.model.js";


//barber registeration
export const registerBarber = async (req, res, next) => {
    try {
        // Extracting data from the request body
        const { firstname, lastname, DOB, mobile, city, address, languages, profilePic, services } = req.body;

        // Checking for required fields
        if (!firstname || !lastname || !DOB || !mobile || !city || !address) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }
        // Checking if services contain valid values
        const validServices = ["haircut", "nails", "facial", "coloring", "facepack"];
        const invalidServices = services.filter(service => !validServices.includes(service));
        if (invalidServices.length > 0) {
            return res.status(400).json({ success: false, message: `Invalid services provided: ${invalidServices.join(", ")}` });
        }

        const { longitude, latitude } = await geocodeAddress(address);

        // Creating a new Barber instance
        const newBarber = new Barber({
            firstname,
            lastname,
            DOB,
            mobile,
            city,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            address,
            languages,
            profilePic
        });
        const savedBarber = await newBarber.save();
        const token = jwt.sign({
            userId: user._id,
        }, process.env.JWT_SECRET, { expiresIn: "24h" })

        res.cookie('token', token);
        res.status(201).json({ message: "Successfully registered barber", success: true, barber: savedBarber, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
//login barber
export const loginBarber = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ message: "Please provide mobile number", success: false });

        req.app.locals.phone = phoneNumber;
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong", success: false, err });
    }
}
//generating-otp
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
// verifyotp
export const verifyOTP = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (parseInt(req.app.locals.otp) === parseInt(code)) {
            const phone = req.app.locals.phone;
            const p = phone.replace("+", "");
            const user = await Barber.findOne({ phoneNumber: p });
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
//find barber by id need to send the user id.
export const findBarberById = async (req, res, next) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID not found", success: false });
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Id", success: false });
    }
    try {
        const barber = await Barber.findById(id)
        return res.status(200).json(
            {
                success: true,
                message: "Successful",
                barber
            }
        )
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

//get all barbers
export const getAllBarbers = async (req, res, next) => {
    try {
        const barbers = await Barber.find();
        res.status(200).json({ success: true, barbers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
// Controller function to find barbers near a location specified by name
export const findBarbersNearLocation = async (req, res) => {

    try {
        const locationName = req.body.location;

        const { longitude: lng, latitude: lat } = await geocodeAddress(locationName);

        // Finding barbers near the specified location coordinates using a geospatial query
        const barbersNearLocation = await Barber.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 1000000 // Maximum distance in meters (adjust as needed)
                }
            }
        });

        // Returning the list of barbers near the specified location
        res.json({ success: true, barbers: barbersNearLocation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//barber review
export const barberReviews = async (req, res, next) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ message: "Id missing", success: false });
    }
    try {
        const barber = await Barber.findById(id);
        return res.status(200).json({ message: "Successfull", success: true, reviews: barber.reviews });

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }

}
//reviewing the barber and updating the review if already reviewd
export const createBarberReview = async (req, res, next) => {
    try {
        const { rating, comment, barberId } = req.body;
        const review = {
            user: req.body.id,
            name: req.body.name,
            rating: Number(rating),
            comment
        }
        const barber = await Barber.findById(barberId);
        const isReviewd = barber.reviews.find(rev => rev.user.toString() === req.body.id.toString());

        if (isReviewd) {
            barber.reviews.forEach(rev => {
                if (rev.user.toString() === req.body.id.toString()) {
                    rev.comment = comment;
                    rev.rating = rating;
                }
            })
        }
        else {
            barber.reviews.push(review);
        }

        let avg = 0;
        barber.reviews.forEach((rev) => {
            avg += rev.rating
        })
        barber.rating = avg / barber.reviews.length;


        await barber.save();
        res.status(200)
            .json({ message: "Successfully Reviewd", success: true });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", success: false })
    }
}
//delete barber review
export const deleteReview = async (req, res, next) => {
    try {
        const barber = await Barber.findById(req.query.barberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found...!", sucees: false });
        }
        const reviews = barber.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());
        let avg = 0;
        reviews.forEach(rev => {
            avg += rev.rating
        });
        const rating = avg / reviews.legnth;
        await Barber.findByIdAndUpdate(req.query.barberId, { reviews, rating }, { new: true });
        res.status(200).json({
            success: true,
            message: "Deleted Successfully"
        })
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
}