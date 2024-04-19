// services/geocoding.js
import NodeGeocoder from "node-geocoder"

// Creating a geocoder instance with OpenStreetMap as the provider
const geocoder = NodeGeocoder({
    provider: 'openstreetmap'
});

export const geocodeAddress = async (address) => {
    try {
        const response = await geocoder.geocode(address);
        console.log(response[0]);
        if (response && response.length > 0) {
            return {
                latitude: response[0].latitude,
                longitude: response[0].longitude
            };
        } else {
            throw new Error('No results found for the address');
        }
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
}