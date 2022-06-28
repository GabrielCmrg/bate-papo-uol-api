export * as messagesDb from './messagesDb.js';
export * as participantsDb from './participantsDb.js';

import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);
let db;
client.connect().then(() => {
    db = client.db(process.env.DB_NAME);
})

export { db };