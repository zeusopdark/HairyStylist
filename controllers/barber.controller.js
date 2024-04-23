import mongoose from "mongoose";
import { geocodeAddress } from "../helper/map.js";
import Barber from "../model/barber.model.js";

//find barber by id need to send the user id.
export const findBarberById = async (req, res, next) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID not found", success: false });
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Id", success: false });
    }
    try {
        const barber = await Barber.findById(id).populate("user");
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
        const barbers = await Barber.find().populate("user");
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
//barber details
export const barberDetails = async (req, res, next) => {
    try {
        // Extracting data from the request body
        let { user, location, about, contactInformation, rate, isAvailable } = req.body;
        const { longitude: lng, latitude: lat } = await geocodeAddress(location);
        const locationWithCoordinates = {
            type: "Point",
            coordinates: [lng, lat]
        };
        about = about || '';
        contactInformation = contactInformation || [];
        rate = rate || 0;
        isAvailable = isAvailable === undefined ? true : isAvailable;

        // Creating a new Barber instance
        const newBarber = new Barber({
            user,
            location: locationWithCoordinates,
            place: location,
            about,
            contactInformation,
            rate,
            isAvailable
        });


        const savedBarber = await newBarber.save();

        res.status(201).json({ message: "Successfull", success: true, barber: savedBarber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
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