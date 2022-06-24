import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';

import { participantSchema, messageSchema } from './schemas.js';

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
    console.log('POST request made to route /participants');
    const validation = participantSchema.validate(req.body);

    if (validation.error) {
        res.sendStatus(422);
    }
    
    db.collection('participants').findOne({ name }).then(participant => {
        console.log('Done!');
        if (participant !== null) {
            console.log(`Participant ${name} already exists`);
            res.sendStatus(409);
            console.log('Response sent!');
            return;
        }

        db.collection('participants').insertOne({ name, lastStatus: Date.now() }).then(() => {
            console.log('Done!');

            const loginMessage = {
                from: name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs().format('HH:mm:ss'),
            };

            db.collection('messages').insertOne(loginMessage).then(() => {
                console.log('Done!');
                res.sendStatus(201);
                console.log('Response sent!');
            });
            console.log('Saving login message...');
        });
        console.log('Saving participant...')
    });
    console.log(`Searching for ${name} on database...`);
});

app.get('/participants', (req, res) => {
    console.log('GET request made to route /participants');
    db.collection('participants').find().toArray().then(participants => {
        console.log('Done!');
        res.send(participants);
        console.log('Response sent!');
    });
    console.log('Searching all participants...');
});

app.listen(process.env.PORT, () => {
    console.log(`App running on:\nhttp://localhost:${process.env.PORT}\nhttp://127.0.0.1:${process.env.PORT}`);
});