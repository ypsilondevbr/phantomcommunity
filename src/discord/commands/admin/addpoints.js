const { EmbedBuilder } = require('discord.js');
const { addPoints } = require('../../../database/db');

module.exports = {
    name: 'addpoints',
    description: 'Adiciona pontos à conta de um usuário (Apenas Owner)',
    execute: async (message, args) => {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (message.author.id !== message.guild.ownerId) {
            return message.reply("❌ **Acesso Negado.** Apenas o **Dono** do servidor pode usar este comando.");
        }

        if (!target) {
            return message.reply("❌ Mencione o usuário que receberá os pontos. Ex: `.phantom addpoints @user 500`");
        }

        if (isNaN(amount) || amount <= 0) {
            return message.reply("❌ Forneça uma quantidade válida e positiva de pontos.");
        }

        addPoints(target.id, amount);
        message.reply(`✅ **Sucesso!** Foi adicionado **${amount} pontos** na conta de <@${target.id}>!`);
    }
};
