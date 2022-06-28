import dotenv from 'dotenv';

import { db } from './index.js';

dotenv.config()

export const saveParticipant = async function (participant) {
    await db.collection('participants').insertOne(participant);
    console.log('New participant saved: ' + participant.name);

    return;
};

export const getParticipantByName = async function (name) {
    const participant = await db.collection('participants').findOne({ name });

    return participant;
};

export const getAllParticipants = async function () {
    const allParticipants = await db.collection('participants').find().toArray();

    return allParticipants;
};

export const getIddleParticipants = async function (time) {
    const S = 1000;
    const iddleLimit = Date.now() - time * S;
    const iddleParticipants = db.collection('participants').find({
        lastStatus: { $lt: iddleLimit },
    }).toArray();
    
    return iddleParticipants;
};

export const updateParticipant = async function (name) {
    const { matchedCount, modifiedCount } = await db.collection('participants').updateOne(
        { name },
        { $set: { lastStatus: Date.now() }}
    );

    if (!matchedCount) {
        return false;
    } else if (modifiedCount) {
        console.log('Updated lastStatus of ' +  name);
        return true;
    }
};

export const deleteParticipant = async function (participant) {
    await db.collection('participants').deleteOne(participant);
    console.log('Deleted participant: ' + participant.name);

    return;
};