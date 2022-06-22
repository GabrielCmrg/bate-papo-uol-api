import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
app.use(express.json());
console.log('JSON enabled');
app.use(cors());
console.log('CORS enabled');

const client = new MongoClient(process.env.MONGO_URI);
console.log('Created client for mongo using ' + process.env.MONGO_URI);
let db = null;
client.connect().then(() => {
    console.log('Client connected');
    db = client.db('bate-papo-uol');
    console.log('Database selected');
});

app.post('/participants', (req, res) => {
    const { name } = req.body;
    
    if (typeof(name) !== 'string' || name.length === 0) {
        res.sendStatus(422);
        return;
    }

    db.collection('participants').findOne({ name }).then(participant => {
        if (participant !== null) {
            res.sendStatus(409);
            return;
        }

        db.collection('participants').insertOne({ name, lastStatus: Date.now() }).then(() => {
            db.collection('messages').insertOne({
                from: name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs().format('HH:mm:ss'),
            }).then(() => {res.sendStatus(201)});
        });
        
    });
});

app.listen(process.env.PORT, () => {
    console.log(`App running on:\nhttp://localhost:${process.env.PORT}\nhttp://127.0.0.1:${process.env.PORT}`);
});