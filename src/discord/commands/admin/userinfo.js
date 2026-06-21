const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.member;

        // Buscar usuário completo para pegar o banner
        await target.user.fetch();

        const roles = target.roles.cache
            .filter(role => role.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString());
        
        const rolesDisplay = roles.length > 15 ? `${roles.slice(0, 15).join(', ')} e mais ${roles.length - 15}...` : roles.join(', ') || 'Nenhum';
        
        const highestRole = target.roles.highest.id !== message.guild.id ? target.roles.highest.toString() : 'Nenhum';

        const flags = target.user.flags ? target.user.flags.toArray().join(', ').replace(/HypeSquadOnlineHouse1/g, '🏠 Bravery').replace(/HypeSquadOnlineHouse2/g, '🏠 Brilliance').replace(/HypeSquadOnlineHouse3/g, '🏠 Balance') : 'Nenhuma';

        const embed = new EmbedBuilder()
            .setColor(target.displayHexColor !== '#000000' ? target.displayHexColor : '#2b2d31')
            .setTitle(`Informações de ${target.user.username}`)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '👤 Identificação', value: `**Tag:** ${target.user.tag}\n**ID:** ${target.id}\n**Bot:** ${target.user.bot ? 'Sim' : 'Não'}`, inline: true },
                { name: '📅 Datas', value: `**Criou a conta em:** <t:${Math.floor(target.user.createdTimestamp / 1000)}:d>\n**Entrou aqui em:** <t:${Math.floor(target.joinedTimestamp / 1000)}:d>`, inline: true },
                { name: '🏅 Emblemas', value: flags || 'Nenhum', inline: true },
                { name: '🚀 Impulso (Boost)', value: target.premiumSince ? `Desde <t:${Math.floor(target.premiumSinceTimestamp / 1000)}:d>` : 'Não está impulsionando', inline: true },
                { name: `🎭 Cargos [${roles.length}]`, value: `**Cargo mais alto:** ${highestRole}\n${rolesDisplay}`, inline: false }
            )
            .setFooter({ text: `Requisitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        if (target.user.bannerURL()) {
            embed.setImage(target.user.bannerURL({ dynamic: true, size: 1024 }));
        }

        return message.reply({ embeds: [embed] });
    }
};
