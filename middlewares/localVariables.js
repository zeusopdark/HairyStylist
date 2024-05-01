export const localVairables = (req, res, next) => {
    req.app.locals = {
        otp: null,
        phone: ""
    }
    next();
}