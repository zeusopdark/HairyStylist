import mongoose from "mongoose";

// Defining the schema for the Barber model
const barberSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        unique: [true, "Please provide unique mobile number"]
    },
    city: {
        type: String,
        required: true
    },
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
    address: {
        type: String,
        require: true
    },
    languages: {
        type: Array
    },
    profilePic: {
        type: String,
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

// Indexing the location field for geospatial queries
barberSchema.index({ location: '2dsphere' });

const Barber = mongoose.model('Barber', barberSchema);
export default Barber;
