import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import mongoSanitize from "express-mongo-sanitize";
    
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());





const PORT = process.env.PORT || 3000;

// connectDB();

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});
