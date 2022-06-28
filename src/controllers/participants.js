import { loginService, validationService } from '../services/index.js';

export const login = async (req, res) => {
    console.log('POST request made to route /participants');

    const validation = validationService.validateParticipant(req.body);

    if (!validation) {
        return res.sendStatus(422);
    }

    try {
        const { name } = validation;

        const saved = loginService.register(name);

        if (!saved) {
            return res.sendStatus(409);
        }

        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

export const getParticipants = async (req, res) => {
    console.log('GET request made to route /participants');

    try {
        const participants = loginService.onlineMembers();

        return res.json(participants);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};