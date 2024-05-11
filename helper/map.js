import axios from "axios"
export const geocodeAddress = async (address) => {
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return { longitude: location.lng, latitude: location.lat };
        } else {
            throw new Error("No results found for the address");
        }
    } catch (error) {
        console.error("Error geocoding address:", error.message);
        throw error;
    }
};
export const getReverseGeocode = async (latitude, longitude) => {
    try {
        const apiKey = process.env.GOOGLE_MAP_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        const response = await axios.get(url);

        if (response.data && response.data.results && response.data.results.length > 0) {
            const address = response.data.results[0].formatted_address;
            console.log('Address:', address);
            return address;
        } else {
            throw new Error('No address found for the given coordinates');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};
