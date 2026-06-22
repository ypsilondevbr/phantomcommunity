const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logAI } = require('../core/logger');

const geminiTools = [{
    functionDeclarations: [
        {
            name: "clear_messages",
            description: "Apaga um número específico de mensagens no canal atual onde o comando foi enviado. Use apenas quando o usuário pedir explicitamente para limpar o chat.",
            parameters: {
                type: "OBJECT",
                properties: {
                    amount: { type: "INTEGER", description: "Quantidade de mensagens a apagar (de 1 a 100)" }
                },
                required: ["amount"]
            }
        },
        {
            name: "kick_member",
            description: "Expulsa (kick) um usuário do servidor. Você precisa do ID do usuário ou menção.",
            parameters: {
                type: "OBJECT",
                properties: {
                    user_id: { type: "STRING", description: "O ID numérico do usuário ou menção (ex: <@123...>) para expulsar." },
                    reason: { type: "STRING", description: "Motivo da expulsão" }
                },
                required: ["user_id"]
            }
        },
        {
            name: "ban_member",
            description: "Bane um usuário do servidor. Você precisa do ID do usuário ou menção.",
            parameters: {
                type: "OBJECT",
                properties: {
                    user_id: { type: "STRING", description: "O ID numérico do usuário ou menção para banir." },
                    reason: { type: "STRING", description: "Motivo do banimento" }
                },
                required: ["user_id"]
            }
        },
        {
            name: "timeout_member",
            description: "Coloca um usuário de castigo (timeout), impedindo-o de falar no servidor por um tempo.",
            parameters: {
                type: "OBJECT",
                properties: {
                    user_id: { type: "STRING", description: "O ID numérico do usuário ou menção." },
                    minutes: { type: "INTEGER", description: "Tempo do castigo em minutos." },
                    reason: { type: "STRING", description: "Motivo do castigo." }
                },
                required: ["user_id", "minutes"]
            }
        },
        {
            name: "create_text_channel",
            description: "Cria um novo canal de texto no servidor.",
            parameters: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING", description: "Nome do novo canal (sem espaços, minúsculo)" },
                    topic: { type: "STRING", description: "Tópico ou descrição do canal (opcional)" }
                },
                required: ["name"]
            }
        },
        {
            name: "delete_channel",
            description: "Deleta um canal de texto ou voz do servidor.",
            parameters: {
                type: "OBJECT",
                properties: {
                    channel_name: { type: "STRING", description: "Nome exato ou menção do canal a ser deletado" }
                },
                required: ["channel_name"]
            }
        },
        {
            name: "send_announcement",
            description: "Envia um anúncio formal (Embed bonito) em um canal específico.",
            parameters: {
                type: "OBJECT",
                properties: {
                    channel_name: { type: "STRING", description: "Nome ou menção do canal onde enviar o aviso" },
                    title: { type: "STRING", description: "Título do aviso" },
                    description: { type: "STRING", description: "Conteúdo completo do aviso" }
                },
                required: ["channel_name", "title", "description"]
            }
        }
    ]
}];

function extractId(str) {
    if (!str) return null;
    const match = str.match(/\d+/);
    return match ? match[0] : null;
}

async function executeTool(name, args, message) {
    const guild = message.guild;
    const botMember = guild.members.me;

    switch (name) {
        case "clear_messages": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return "❌ Falha: O bot não tem permissão de 'Gerenciar Mensagens'.";
            }
            let amount = args.amount;
            if (amount < 1 || amount > 100) return "❌ Falha: A quantidade de mensagens deve ser entre 1 e 100.";
            await message.channel.bulkDelete(amount, true).catch(() => {});
            return `✅ Ação executada pela IA: ${amount} mensagens apagadas.`;
        }

        case "kick_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) return "❌ Falha: Bot sem permissão de Kick.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            if (!member.kickable) return "❌ Falha: Usuário inatingível (cargo superior).";
            await member.kick(args.reason || "Decisão da IA Administradora");
            return `✅ Ação executada pela IA: Usuário <@${targetId}> expulso.`;
        }

        case "ban_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha: Bot sem permissão de Ban.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            if (!member.bannable) return "❌ Falha: Usuário inatingível (cargo superior).";
            await member.ban({ reason: args.reason || "Decisão da IA Administradora" });
            return `✅ Ação executada pela IA: Usuário <@${targetId}> banido.`;
        }

        case "timeout_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return "❌ Falha: Bot sem permissão de Timeout.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            const ms = args.minutes * 60 * 1000;
            await member.timeout(ms, args.reason || "Decisão da IA Administradora");
            return `✅ Ação executada pela IA: Usuário <@${targetId}> mutado por ${args.minutes} min.`;
        }

        case "create_text_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Bot sem permissão.";
            const channel = await guild.channels.create({
                name: args.name,
                type: 0,
                topic: args.topic || ""
            });
            return `✅ Ação executada pela IA: Canal de texto <#${channel.id}> criado.`;
        }

        case "delete_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Bot sem permissão.";
            let channelName = args.channel_name.replace(/<#|>/g, '');
            let channel = guild.channels.cache.get(channelName);
            if (!channel) channel = guild.channels.cache.find(c => c.name.toLowerCase() === channelName.toLowerCase());
            if (!channel) return "❌ Falha: Canal não encontrado.";
            await channel.delete();
            return `✅ Ação executada pela IA: Canal '${channel.name}' deletado.`;
        }

        case "send_announcement": {
            let channelName = args.channel_name.replace(/<#|>/g, '');
            let channel = guild.channels.cache.get(channelName);
            if (!channel) channel = guild.channels.cache.find(c => c.name.toLowerCase() === channelName.toLowerCase());
            if (!channel) return "❌ Falha: Canal de destino não encontrado.";
            
            const embed = new EmbedBuilder()
                .setTitle(args.title)
                .setDescription(args.description)
                .setColor(0x00FF00)
                .setFooter({ text: "Enviado por Phantom IA", iconURL: message.client.user.displayAvatarURL() });
                
            await channel.send({ embeds: [embed] });
            return `✅ Ação executada pela IA: Anúncio enviado em <#${channel.id}>.`;
        }

        default:
            return `❌ Ferramenta desconhecida solicitada pela IA: ${name}`;
    }
}

module.exports = {
    geminiTools,
    executeTool
};
