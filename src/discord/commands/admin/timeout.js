const { PermissionsBitField } = require('discord.js');
const { logNormal } = require('../../../core/logger');
const ms = require('ms'); // Precisamos instalar o pacote ms depois

module.exports = {
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("❌ Você não tem permissão para aplicar timeout.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("❌ Mencione um usuário válido para o timeout.");

        if (!target.moderatable) {
            return message.reply("❌ Não posso aplicar timeout neste usuário.");
        }

        const timeString = args[1];
        if (!timeString) return message.reply("❌ Especifique um tempo. Ex: `10m`, `1h`, `1d`.");

        const timeMs = ms(timeString);
        if (!timeMs) return message.reply("❌ Formato de tempo inválido. Use algo como `10m` ou `1h`.");

        const reason = args.slice(2).join(" ") || "Nenhum motivo informado";

        try {
            await target.timeout(timeMs, reason);
            logNormal(message.guild.id, message.author.id, "TIMEOUT", target.id, reason);
            return message.reply(`✅ **${target.user.tag}** recebeu timeout de ${timeString}.\nMotivo: ${reason}`);
        } catch (err) {
            console.error(err);
            return message.reply("❌ Ocorreu um erro ao aplicar timeout.");
        }
    }
};
