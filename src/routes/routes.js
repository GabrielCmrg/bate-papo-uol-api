import express from 'express';

import { participants, status, messages } from '../controllers/index.js';

const router = express.Router();

// participants routes
router.post('/participants', participants.login);

router.get('/participants', participants.getParticipants);

// messages routes
router.post('/messages', messages.sendMessage);

router.get('/messages', messages.getUserMessages);

router.put('/messages/:messageId', messages.editUserMessage);

router.delete('/messages/:messageId', messages.deleteUserMessage);

// status routes
router.post('/status', status.maintainLogin);

export default router;