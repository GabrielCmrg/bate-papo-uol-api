import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import routes from './routes/routes.js';
import { loginService } from './services/index.js';

dotenv.config();

const app = express();
app.use(express.json());
console.log('JSON enabled');
app.use(cors());
console.log('CORS enabled');
app.use('/', routes);

app.listen(process.env.PORT, () => {
    console.log(`App running on:\nhttp://localhost:${process.env.PORT}\nhttp://127.0.0.1:${process.env.PORT}`);
    const S = 1000;
    const TIME_INTERVAL = 15;
    setInterval(loginService.logoutIddleMembers, TIME_INTERVAL * S);
});