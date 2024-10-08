import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
import mongoose from "mongoose"
import userRoutes from "./routes/user.route.js"
import barberRoutes from "./routes/barber.route.js"
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const corsOption = {
    origin: "http://localhost:3000",
    credentials: true,
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.use(morgan('tiny'));
app.use("/api/user", userRoutes)
app.use("/api/barber", barberRoutes);


app.get("/", (req, res) => {
    res.status(201).json("Home GET Request");
});

//Database connection
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.once('open', () => {
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT} Succesfully Connected to MongoDb`))
})
mongoose.connection.on("error", (error) => {
    console.log(`Error in connecting MongoDB ${error}`);
})