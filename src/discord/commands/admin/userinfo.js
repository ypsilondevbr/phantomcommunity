const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;

        const roles = target.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Nenhum';

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`Informações de ${target.user.username}`)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: target.id, inline: true },
                { name: 'Entrada no Servidor', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Conta Criada em', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Cargos', value: roles, inline: false }
            )
            .setFooter({ text: `Requisitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
