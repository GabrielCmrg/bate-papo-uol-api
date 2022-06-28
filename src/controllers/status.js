import { loginService, validationService } from '../services/index.js';

export const maintainLogin = async (req, res) => {
    console.log('POST request made to route /status');

    const validation = validationService.validateHeader(req.headers);

    if (!validation) {
        return res.sendStatus(422);
    }

    try {
        const name = validation.user;
        const updated = loginService.updateStatus(name);

        if (!updated) {
            return res.sendStatus(404);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};