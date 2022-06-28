import { loginService, messagesService, validationService } from '../services/index.js';

export const sendMessage = async (req, res) => {
    console.log('POST request made to route /messages');

    const headerValidation = validationService.validateHeader(req.headers);
    const bodyValidation = validationService.validateMessage(req.body);

    if (!headerValidation || !bodyValidation) {
        return res.sendStatus(422);
    }

    try {
        const { user } = headerValidation;
        const isOnline = await loginService.isOnline(user);

        if (!isOnline) {
            return res.sendStatus(422);
        }

        await messagesService.saveMessage(bodyValidation, user);
        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

export const getUserMessages = async (req, res) => {
    console.log('GET request made to route /messages');

    const validation = validationService.validateHeader(req.headers);

    if (!validation) {
        return res.sendStatus(422);
    }

    const { user } = validation;
    const limit = req.query.limit;

    try {
        const allowedMessages = await messagesService.userMessages(user);

        const sortedMessages = messagesService.sortByTime(allowedMessages);

        const limitNumber = parseInt(limit);

        if (!limit) {
            return res.json(sortedMessages);
        } else if (isNaN(limitNumber)) {
            return res.sendStatus(422);
        }

        return res.json(sortedMessages.slice(-limitNumber));
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

export const editUserMessage = async (req, res) => {
    const messageId = req.params.messageId;
    console.log('PUT request made to route /messages/' + messageId);

    const headerValidation = validationService.validateHeader(req.headers);
    const bodyValidation = validationService.validateMessage(req.body);

    if (!headerValidation || !bodyValidation || !messageId) {
        return res.sendStatus(422);
    }

    try {
        const from = headerValidation.user;
        const isOnline = await loginService.isOnline(from);

        if (!isOnline) {
            return res.sendStatus(422);
        }

        const result = await messagesService.updateMessage(messageId, from, bodyValidation);

        if (result === 'not found') {
            return res.sendStatus(404);
        }
    
        if (result === 'unauthorized') {
            return res.sendStatus(401);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

export const deleteUserMessage = async (req, res) => {
    const messageId = req.params.messageId;
    console.log('DELETE request made to route /messages/' + messageId);

    const validation = validationService.validateHeader(req.headers);

    if (!validation || !messageId) {
        return res.sendStatus(422);
    }

    try {
        const name = validation.user;
        
        const result = await messagesService.deleteMessage(messageId, name);

        if (result === 'not found') {
            return res.sendStatus(404);
        }
    
        if (result === 'unauthorized') {
            return res.sendStatus(401);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};