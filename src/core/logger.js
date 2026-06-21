const { getDB } = require('../database/db');

function logNormal(guildId, userId, action, targetId, reason) {
    try {
        const db = getDB();
        db.prepare(`
            INSERT INTO server_logs (guild_id, user_id, action, target_id, reason)
            VALUES (?, ?, ?, ?, ?)
        `).run(guildId, userId, action, targetId, reason);
        console.log(`[LOG] [${guildId}] ${userId} executou ${action}`);
    } catch (err) {
        console.error("Erro ao registrar logNormal:", err);
    }
}

function logAI(guildId, userId, request, plan, toolsUsed, status) {
    try {
        const db = getDB();
        db.prepare(`
            INSERT INTO ai_logs (guild_id, user_id, request, plan, tools_used, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            guildId, 
            userId, 
            request, 
            plan ? JSON.stringify(plan) : null, 
            toolsUsed ? JSON.stringify(toolsUsed) : null, 
            status
        );
        console.log(`[AI LOG] [${guildId}] ${userId} - Status: ${status}`);
    } catch (err) {
        console.error("Erro ao registrar logAI:", err);
    }
}

module.exports = {
    logNormal,
    logAI
};
