import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';

import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import { participantSchema, messageSchema, headerSchema } from './schemas.js';

dotenv.config();

dayjs.extend(customParseFormat);

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

        return res.json(participants);
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
        console.log('Message saved');

        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.get('/messages', async (req, res) => {
    console.log('GET request made to route /messages');

    const validation = headerSchema.validate(req.headers);

    if (validation.error) {
        return res.sendStatus(422);
    }

    const { user } = req.headers;
    const limit = req.query.limit;

    try {
        const allMessages = await db.collection('messages').find().toArray();
        const allowedMessages = allMessages.filter(message => {
            const isUserMessage = message.from === user;
            const isMessageToUser = message.to === user;
            const isPublicMessage = message.to === 'Todos';

            if (isUserMessage || isMessageToUser || isPublicMessage) {
                return true;
            } else {
                return false;
            }
        });

        allowedMessages.sort((a, b) => {
            const today = dayjs().format('DD/MM/YYYY') + '-';
            const dateOfA = dayjs(today + a.time, 'DD/MM/YYYY-HH:mm:ss');
            const dateOfB = dayjs(today + b.time, 'DD/MM/YYYY-HH:mm:ss');
            if (dateOfA.isBefore(dateOfB)) return -1;
            if (dateOfA.isAfter(dateOfB)) return 1;
            return 0;
        });

        const limitNumber = parseInt(limit);

        if (!limit) {
            return res.json(allowedMessages);
        } else if (isNaN(limitNumber)) {
            return res.sendStatus(422);
        }

        return res.json(allowedMessages.slice(-limitNumber));
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post('/status', async (req, res) => {
    console.log('POST request made to route /status');
    
    const validation = headerSchema.validate(req.headers);

    if (validation.error) {
        return res.sendStatus(422);
    }

    try {
        const { user } = req.headers;
        const { matchedCount, modifiedCount } = await db.collection('participants').updateOne(
            { name: user },
            { $set: { lastStatus: Date.now() }}
        );

        if (!matchedCount) {
            return res.sendStatus(404);
        } else if (modifiedCount) {
            console.log('Updated lastStatus of ' +  user);
            return res.sendStatus(200);
        }

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

setInterval(async () => {
    const iddleParticipants = await db.collection('participants').find({
        lastStatus: { $lt: (Date.now() - 10_000) },
    }).toArray();
    
    for (const participant of iddleParticipants) {
        await db.collection('participants').deleteOne(participant);
        console.log('Deleted participant: ' + participant.name);

        const logoutMessage = {
            from: participant.name,
            to: 'Todos',
            text: 'sai da sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss'),
        };

        await db.collection('messages').insertOne(logoutMessage);
        console.log('Saved logout message');
    }
}, 15_000);

app.listen(process.env.PORT, () => {
    console.log(`App running on:\nhttp://localhost:${process.env.PORT}\nhttp://127.0.0.1:${process.env.PORT}`);
});