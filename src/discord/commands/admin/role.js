const { PermissionsBitField } = require('discord.js');

module.exports = {
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("❌ Você não tem permissão para gerenciar cargos.");
        }

        const subCommand = args[1]?.toLowerCase();
        
        if (subCommand === 'create') {
            const roleName = args.slice(2).join(" ");
            if (!roleName) return message.reply("❌ Forneça o nome do cargo. Ex: `.phantom role create Moderador`");
            
            try {
                const role = await message.guild.roles.create({
                    name: roleName,
                    color: 'Random', // Cor aleatória padrão
                    reason: `Requisitado por ${message.author.tag}`
                });
                return message.reply(`✅ Cargo ${role.toString()} criado com sucesso!`);
            } catch (error) {
                console.error(error);
                return message.reply("❌ Erro ao criar o cargo. Eu possuo permissões suficientes?");
            }
        }

        if (subCommand === 'delete') {
            const roleMention = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            if (!roleMention) return message.reply("❌ Mencione o cargo ou coloque o ID a ser apagado.");

            try {
                const name = roleMention.name;
                await roleMention.delete(`Requisitado por ${message.author.tag}`);
                return message.reply(`✅ O cargo **${name}** foi obliterado.`);
            } catch (error) {
                console.error(error);
                return message.reply("❌ Não pude deletar o cargo. Talvez ele seja superior ao meu na hierarquia.");
            }
        }

        return message.reply("❌ Subcomando inválido! Tente:\n`.phantom role create <nome>`\n`.phantom role delete <@cargo>`");
    }
};
