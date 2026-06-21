const { PermissionsBitField } = require('discord.js');
const { logNormal } = require('../../../core/logger');

module.exports = {
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("❌ Você não tem permissão para advertir (warn) membros.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("❌ Mencione um usuário válido para advertir.");

        const reason = args.slice(1).join(" ") || "Nenhum motivo informado";

        try {
            logNormal(message.guild.id, message.author.id, "WARN", target.id, reason);
            
            // Tenta avisar o usuário via DM
            await target.send(`⚠️ Você recebeu uma advertência no servidor **${message.guild.name}**.\n**Motivo:** ${reason}`).catch(() => null);

            return message.reply(`✅ **${target.user.tag}** foi advertido com sucesso.\nMotivo: ${reason}`);
        } catch (err) {
            console.error(err);
            return message.reply("❌ Ocorreu um erro ao aplicar o warn.");
        }
    }
};
