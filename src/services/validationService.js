import { stripHtml } from 'string-strip-html';

import { headerSchema, participantSchema, messageSchema } from '../models/schemas.js';

export const validateHeader = function (header) {
    const changeableHeader = {...header};
    const valid = headerSchema.validate(changeableHeader);
    if (valid.error) {
        return false;
    }

    const sanitizedHeader = { user: stripHtml(valid.value.user).result };
    const validation = headerSchema.validate(sanitizedHeader);

    if (validation.error) {
        return false;
    }

    return validation.value;
};

export const validateParticipant = function (body) {
    const changeableBody = {...body};
    const valid = participantSchema.validate(changeableBody);
    if (valid.error) {
        return false;
    }

    const sanitizedBody = { name: stripHtml(valid.value.name).result }
    const validation = participantSchema.validate(sanitizedBody);

    if (validation.error) {
        return false;
    }

    return validation.value;
};

export const validateMessage = function (body) {
    const changeableBody = {...body};
    const valid = messageSchema.validate(changeableBody);
    if (valid.error) {
        return false;
    }

    const sanitizedBody = {
        to: stripHtml(valid.value.to).result,
        text: stripHtml(valid.value.text).result,
        type: stripHtml(valid.value.type).result,
    };
    const validation = messageSchema.validate(sanitizedBody);

    if (validation.error) {
        return false;
    }

    return validation.value;
};