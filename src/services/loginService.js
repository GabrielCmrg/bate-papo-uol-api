import { messagesService } from "./index.js";

import { participantsDb } from "../db/index.js";

export const register = async function (name) {
    const participant = await participantsDb.getParticipantByName(name);
    if (participant !== null) {
        return false;
    }

    await participantsDb.saveParticipant({ name, lastStatus: Date.now() });

    await messagesService.saveLoginMessage(name);
    
    return true;
};

export const onlineMembers = async function () {
    const members = await participantsDb.getAllParticipants();

    return members;
};

export const updateStatus = async function (name) {
    const updated = await participantsDb.updateParticipant(name);

    if (updated) {
        return true;
    }

    return false;
};

export const logoutIddleMembers = async function() {
    try {
        const IDDLE_TIME = 10;
        const iddleParticipants = await participantsDb.getIddleParticipants(IDDLE_TIME);
        
        for (const participant of iddleParticipants) {
            await participantsDb.deleteParticipant(participant);
    
            await messagesService.saveLogoutMessage(participant.name);
        }
        
        return;
    } catch (error) {
        console.error(error);
        return;
    }
};

export const isOnline = async function (name) {
    const user = await participantsDb.getParticipantByName(name);

    if (user === null) {
        return false;
    }

    return true;
};