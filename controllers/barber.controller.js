import { geocodeAddress } from "../helper/map.js";
import Barber from "../model/barber.model.js";

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

export const barberDetails = async (req, res, next) => {
    try {
        // Extracting data from the request body
        let { location, about, contactInformation, rate, isAvailable } = req.body;
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