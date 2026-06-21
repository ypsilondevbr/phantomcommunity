const { EmbedBuilder } = require('discord.js');
const { getDB } = require('../../../database/db');

module.exports = {
    async execute(message, args, client) {
        const target = message.mentions.users.first() || client.users.cache.get(args[1]);
        if (!target) return message.reply("❌ Mencione um usuário ou informe um ID válido para ver o histórico.");

        const db = getDB();
        const logs = db.prepare(`
            SELECT action, reason, created_at, user_id
            FROM server_logs
            WHERE guild_id = ? AND target_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `).all(message.guild.id, target.id);

        if (logs.length === 0) {
            return message.reply(`✅ O histórico de **${target.tag}** está impecável! Nenhum registro encontrado.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`Histórico de Punições: ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(logs.map(log => {
                return `**[${log.action}]** <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:f>\n↳ **Motivo:** ${log.reason}\n↳ **Por:** <@${log.user_id}>`;
            }).join('\n\n'))
            .setFooter({ text: `Exibindo os últimos 10 registros do banco de dados.` });

        return message.reply({ embeds: [embed] });
    }
};
