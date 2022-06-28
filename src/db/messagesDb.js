import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

import { db } from './index.js';

dotenv.config()

export const saveMessage = async function (message) {
    await db.collection('messages').insertOne(message);

    return;
};

export const getAllMessages = async function () {
    const messages = await db.collection('messages').find().toArray();

    return messages;
};

export const getMessageById = async function (messageId) {
    const search = { _id: new ObjectId(messageId) };
    const message = await db.collection('messages').findOne(search);

    return message;
};

export const updateMessage = async function (messageToUpdate, newMessage) {
    await db.collection('messages').replaceOne(messageToUpdate, newMessage);

    return;
};

export const deleteMessage = async function (message) {
    await db.collection('messages').deleteOne(message);

    return;
};