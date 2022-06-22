import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
console.log("JSON enabled");
app.use(cors());
console.log("CORS enabled");

app.listen(process.env.PORT, () => {
    console.log(`App running on:\
    http://localhost:${process.env.PORT}\
    http://127.0.0.1:${process.env.PORT}`);
});