import mongoose from "mongoose";

// Defining the schema for the Barber model
const barberSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'], // Only accept 'Point' as the value
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers [longitude, latitude]
            required: true
        }
    },
    place: {
        type: String,
        require: true
    },
    about: {
        type: String
    },
    contactInformation: {
        type: [
            {
                phoneNumber: { type: String },
                whatsappNumber: { type: String },
                instagram: { type: String }
            }
        ],
        validate: [arrayLimit, '{PATH} exceeds the limit of 3']
    },
    rate: {
        type: Number
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

// Custom validator function to limit the size of the contactInformation array to 3
function arrayLimit(val) {
    return val.length <= 3;
}

// Indexing the location field for geospatial queries
barberSchema.index({ location: '2dsphere' });

const Barber = mongoose.model('Barber', barberSchema);
export default Barber;
