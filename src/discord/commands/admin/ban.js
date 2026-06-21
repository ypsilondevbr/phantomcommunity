const { PermissionsBitField } = require('discord.js');
const { logNormal } = require('../../../core/logger');

module.exports = {
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("❌ Você não tem permissão para banir membros.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("❌ Mencione um usuário válido para banir.");

        if (!target.bannable) {
            return message.reply("❌ Não posso banir este usuário (hierarquia superior ou falta de permissão).");
        }

        const reason = args.slice(1).join(" ") || "Nenhum motivo informado";

        try {
            await target.ban({ reason });
            logNormal(message.guild.id, message.author.id, "BAN", target.id, reason);
            return message.reply(`✅ **${target.user.tag}** foi banido com sucesso.\nMotivo: ${reason}`);
        } catch (err) {
            console.error(err);
            return message.reply("❌ Ocorreu um erro ao tentar banir o usuário.");
        }
    }
};
