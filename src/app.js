import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());
console.log("JSON enabled");
app.use(cors());
console.log("CORS enabled");

const client = new MongoClient(process.env.MONGO_URI);
let db = null;
client.connect().then(() => {
    db = client.db("bate-papo-uol");
});

app.listen(process.env.PORT, () => {
    console.log(`App running on:\
    http://localhost:${process.env.PORT}\
    http://127.0.0.1:${process.env.PORT}`);
});