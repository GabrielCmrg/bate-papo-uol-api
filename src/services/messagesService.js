import dayjs from 'dayjs';

import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import { messagesDb } from '../db/index.js';

dayjs.extend(customParseFormat);

export const saveLoginMessage = async function (name) {
    const loginMessage = {
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss'),
    };

    await messagesDb.saveMessage(loginMessage);
    console.log('Login message saved');
};

export const saveLogoutMessage = async function (name) {
    const logoutMessage = {
        from: name,
        to: 'Todos',
        text: 'sai da sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss'),
    };

    await messagesDb.saveMessage(logoutMessage);
    console.log('Logout message saved');
};

export const saveMessage = async function (messageBody, sender) {
    const message = {
        ...messageBody,
        from: sender,
        time: dayjs().format('HH:mm:ss'),
    };

    await messagesDb.saveMessage(message);
    console.log('Message saved');
};

export const userMessages = async function (user) {
    const allMessages = await messagesDb.getAllMessages();
    const allowedMessages = allMessages.filter(message => {
        const isUserMessage = message.from === user;
        const isMessageToUser = message.to === user;
        const isPublicMessage = message.to === 'Todos' || message.type === 'message';

        if (isUserMessage || isMessageToUser || isPublicMessage) {
            return true;
        }

        return false;
    });

    return allowedMessages;
};

export const sortByTime = function (messagesList) {
    const mutableList = [...messagesList];
    mutableList.sort((a, b) => {
        const today = dayjs().format('DD/MM/YYYY') + '-';
        const dateOfA = dayjs(today + a.time, 'DD/MM/YYYY-HH:mm:ss');
        const dateOfB = dayjs(today + b.time, 'DD/MM/YYYY-HH:mm:ss');
        if (dateOfA.isBefore(dateOfB)) return -1;
        if (dateOfA.isAfter(dateOfB)) return 1;
        return 0;
    });
    
    return mutableList;
};

export const updateMessage = async function (messageId, from, newMessageBody) {
    const messageToUpdate = await messagesDb.getMessageById(messageId);

    if (messageToUpdate === null) {
        return 'not found';
    }

    if (from !== messageToUpdate.from) {
        return 'unauthorized';
    }

    const message = {
        ...newMessageBody,
        from,
        time: dayjs().format('HH:mm:ss'),
    };

    await messagesDb.updateMessage(messageToUpdate, message);
    console.log('Updated message ' + messageId);

    return 'ok';
};

export const deleteMessage = async function (messageId, from) {
    const messageToDelete = await messagesDb.getMessageById(messageId);

    if (messageToDelete === null) {
        return 'not found';
    }

    if (from !== messageToDelete.from) {
        return 'unauthorized';
    }

    await messagesDb.deleteMessage(messageToDelete);
    console.log('Deleted message ' + messageId);

    return 'ok';
};