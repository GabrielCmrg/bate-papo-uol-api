import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';

import { participantSchema, messageSchema, headerSchema } from './schemas.js';

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

app.post('/participants', async (req, res) => {
    console.log('POST request made to route /participants');
    const validation = participantSchema.validate(req.body);

    if (validation.error) {
        return res.sendStatus(422);
    }

    try {
        const { name } = req.body;

        const participant = await db.collection('participants').findOne({ name });
        if (participant !== null) {
            return res.sendStatus(409);
        }

        await db.collection('participants').insertOne({ name, lastStatus: Date.now() });
        console.log('New participant saved: ' + name);

        const loginMessage = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss'),
        };

        await db.collection('messages').insertOne(loginMessage);
        console.log('Login message saved');

        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.get('/participants', async (req, res) => {
    console.log('GET request made to route /participants');

    try {
        const participants = await db.collection('participants').find().toArray();

        return res.send(participants);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post('/messages', async (req, res) => {
    console.log('POST request made to route /messages');

    const headerValidation = headerSchema.validate(req.headers);
    const bodyValidation = messageSchema.validate(req.body);

    if (headerValidation.error || bodyValidation.error) {
        return res.sendStatus(422);
    }

    const { user } = req.headers;

    // this try/catch is part of validation, since the list of logged users must be done
    // when the post is made.
    try {
        const users = await db.collection('participants').find().toArray().map(p => p.name);

        if (!users.includes(user)) {
            return res.sendStatus(422);
        }
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }

    try {
        const message = {...req.body, from: user, time: dayjs().format('HH:mm:ss')};

        await db.collection('messages').insertOne(message);

        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`App running on:\nhttp://localhost:${process.env.PORT}\nhttp://127.0.0.1:${process.env.PORT}`);
});