import joi from 'joi';

const participantSchema = joi.object({
    name: joi.string().required().trim(),
});

const messageSchema = joi.object({
    to: joi.string().required().trim(),
    text: joi.string().required().trim(),
    type: joi.string().valid('message', 'private_message').required().trim(),
});

const headerSchema = joi.object({
    user: joi.string().required().trim(),
}).unknown(true);

export { messageSchema, participantSchema, headerSchema };