const { PermissionsBitField } = require('discord.js');
const { logNormal } = require('../../../core/logger');

module.exports = {
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply("❌ Você não tem permissão para expulsar membros.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("❌ Mencione um usuário válido para expulsar.");

        if (!target.kickable) {
            return message.reply("❌ Não posso expulsar este usuário (hierarquia superior ou falta de permissão).");
        }

        const reason = args.slice(1).join(" ") || "Nenhum motivo informado";

        try {
            await target.kick(reason);
            logNormal(message.guild.id, message.author.id, "KICK", target.id, reason);
            return message.reply(`✅ **${target.user.tag}** foi expulso com sucesso.\nMotivo: ${reason}`);
        } catch (err) {
            console.error(err);
            return message.reply("❌ Ocorreu um erro ao tentar expulsar o usuário.");
        }
    }
};
