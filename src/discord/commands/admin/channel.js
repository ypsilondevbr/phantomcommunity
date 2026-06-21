const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply("❌ Você não tem permissão para gerenciar canais.");
        }

        const subCommand = args[1]?.toLowerCase();
        
        if (subCommand === 'create') {
            const channelName = args.slice(2).join("-");
            if (!channelName) return message.reply("❌ Forneça o nome do canal. Ex: `.phantom channel create bate-papo`");
            
            try {
                const channel = await message.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    reason: `Requisitado por ${message.author.tag}`
                });
                return message.reply(`✅ Canal ${channel.toString()} criado com sucesso!`);
            } catch (error) {
                console.error(error);
                return message.reply("❌ Erro ao criar o canal. Eu tenho a permissão de Gerenciar Canais?");
            }
        }

        if (subCommand === 'edit') {
            const channelMention = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
            if (!channelMention) return message.reply("❌ Mencione o canal que deseja editar. Ex: `.phantom channel edit #geral novo-nome`");

            const newName = args.slice(3).join("-");
            if (!newName) return message.reply("❌ Informe o novo nome para o canal.");

            try {
                await channelMention.setName(newName, `Requisitado por ${message.author.tag}`);
                return message.reply(`✅ Nome do canal alterado para **#${newName}**.`);
            } catch (error) {
                console.error(error);
                return message.reply("❌ Não pude editar o canal. Faltam permissões?");
            }
        }

        return message.reply("❌ Subcomando inválido! Tente:\n`.phantom channel create <nome>`\n`.phantom channel edit <#canal> <novo-nome>`");
    }
};
