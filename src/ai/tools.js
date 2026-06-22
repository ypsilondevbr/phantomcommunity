const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logAI } = require('../core/logger');

const geminiTools = [{
    functionDeclarations: [
        {
            name: "clear_messages",
            description: "Apaga um número específico de mensagens no canal atual onde o comando foi enviado. Use apenas quando o usuário pedir explicitamente para limpar o chat.",
            parameters: { type: "OBJECT", properties: { amount: { type: "INTEGER", description: "Quantidade de mensagens a apagar (de 1 a 100)" } }, required: ["amount"] }
        },
        {
            name: "kick_member",
            description: "Expulsa (kick) um usuário do servidor.",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção do usuário." }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id"] }
        },
        {
            name: "ban_member",
            description: "Bane um usuário do servidor.",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção do usuário." }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id"] }
        },
        {
            name: "timeout_member",
            description: "Coloca um usuário de castigo (timeout).",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção." }, minutes: { type: "INTEGER", description: "Minutos de castigo." }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id", "minutes"] }
        },
        {
            name: "create_text_channel",
            description: "Cria um novo canal de texto no servidor.",
            parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Nome do canal" }, topic: { type: "STRING", description: "Tópico (opcional)" } }, required: ["name"] }
        },
        {
            name: "delete_channel",
            description: "Deleta um canal de texto ou voz do servidor.",
            parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome exato ou menção do canal" } }, required: ["channel_name"] }
        },
        {
            name: "send_announcement",
            description: "Envia um anúncio formal (Embed bonito) em um canal.",
            parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome ou menção do canal" }, title: { type: "STRING", description: "Título" }, description: { type: "STRING", description: "Conteúdo" } }, required: ["channel_name", "title", "description"] }
        },
        {
            name: "create_role",
            description: "Cria um novo cargo (role) no servidor.",
            parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Nome do cargo" }, color: { type: "STRING", description: "Cor em Hexadecimal (ex: #FF0000)" } }, required: ["name"] }
        },
        {
            name: "delete_role",
            description: "Deleta um cargo existente do servidor.",
            parameters: { type: "OBJECT", properties: { role_name: { type: "STRING", description: "Nome exato ou ID do cargo" } }, required: ["role_name"] }
        },
        {
            name: "add_role_to_member",
            description: "Adiciona um cargo a um usuário.",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção do usuário" }, role_name: { type: "STRING", description: "Nome exato ou ID do cargo" } }, required: ["user_id", "role_name"] }
        },
        {
            name: "remove_role_from_member",
            description: "Remove um cargo de um usuário.",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção do usuário" }, role_name: { type: "STRING", description: "Nome exato ou ID do cargo" } }, required: ["user_id", "role_name"] }
        },
        {
            name: "create_category",
            description: "Cria uma nova categoria de canais no servidor.",
            parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Nome da categoria" } }, required: ["name"] }
        },
        {
            name: "move_channel_to_category",
            description: "Move um canal para dentro de uma categoria.",
            parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome do canal" }, category_name: { type: "STRING", description: "Nome da categoria" } }, required: ["channel_name", "category_name"] }
        },
        {
            name: "lock_channel",
            description: "Tranca um canal, impedindo @everyone de enviar mensagens.",
            parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome ou menção do canal" } }, required: ["channel_name"] }
        },
        {
            name: "unlock_channel",
            description: "Destranca um canal, permitindo @everyone enviar mensagens.",
            parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome ou menção do canal" } }, required: ["channel_name"] }
        },
        {
            name: "change_nickname",
            description: "Muda o apelido (nickname) de um membro no servidor.",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção do usuário" }, new_nickname: { type: "STRING", description: "Novo apelido (vazio para resetar)" } }, required: ["user_id", "new_nickname"] }
        },
        {
            name: "send_dm",
            description: "Envia uma mensagem direta (privada) para um usuário.",
            parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID ou menção do usuário" }, content: { type: "STRING", description: "Mensagem a enviar" } }, required: ["user_id", "content"] }
        },
        {
            name: "create_emoji",
            description: "Cria um emoji personalizado no servidor a partir de um link de imagem.",
            parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Nome do emoji (sem espaços)" }, image_url: { type: "STRING", description: "URL direta da imagem (png, jpg, gif)" } }, required: ["name", "image_url"] }
        },
        {
            name: "delete_emoji",
            description: "Deleta um emoji do servidor.",
            parameters: { type: "OBJECT", properties: { emoji_name: { type: "STRING", description: "Nome exato do emoji" } }, required: ["emoji_name"] }
        },
        {
            name: "change_server_name",
            description: "Muda o nome do servidor.",
            parameters: { type: "OBJECT", properties: { new_name: { type: "STRING", description: "Novo nome do servidor" } }, required: ["new_name"] }
        },
        {
            name: "create_invite",
            description: "Cria um link de convite para o servidor.",
            parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome do canal para o convite (opcional)" } }, required: [] }
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

    const findChannel = (cName) => {
        if (!cName) return message.channel;
        let c = cName.replace(/<#|>/g, '');
        let ch = guild.channels.cache.get(c);
        if (!ch) ch = guild.channels.cache.find(chan => chan.name.toLowerCase() === c.toLowerCase());
        return ch;
    };

    switch (name) {
        case "clear_messages": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) return "❌ Falha: Bot sem permissão de 'Gerenciar Mensagens'.";
            let amount = args.amount;
            if (amount < 1 || amount > 100) return "❌ Falha: Quantidade deve ser entre 1 e 100.";
            await message.channel.bulkDelete(amount, true).catch(() => {});
            return `✅ Ação executada: ${amount} mensagens apagadas.`;
        }

        case "kick_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) return "❌ Falha: Sem permissão de Kick.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            if (!member.kickable) return "❌ Falha: Usuário inatingível.";
            await member.kick(args.reason || "Decisão da IA");
            return `✅ Ação executada: Usuário <@${targetId}> expulso.`;
        }

        case "ban_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha: Sem permissão de Ban.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            if (!member.bannable) return "❌ Falha: Usuário inatingível.";
            await member.ban({ reason: args.reason || "Decisão da IA" });
            return `✅ Ação executada: Usuário <@${targetId}> banido.`;
        }

        case "timeout_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return "❌ Falha: Sem permissão de Timeout.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            const ms = args.minutes * 60 * 1000;
            await member.timeout(ms, args.reason || "Decisão da IA");
            return `✅ Ação executada: Usuário mutado por ${args.minutes} min.`;
        }

        case "create_text_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            const channel = await guild.channels.create({ name: args.name, type: 0, topic: args.topic || "" });
            return `✅ Ação executada: Canal <#${channel.id}> criado.`;
        }

        case "delete_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha: Canal não encontrado.";
            await channel.delete();
            return `✅ Ação executada: Canal deletado.`;
        }

        case "send_announcement": {
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha: Canal não encontrado.";
            const embed = new EmbedBuilder().setTitle(args.title).setDescription(args.description).setColor(0x00FF00);
            await channel.send({ embeds: [embed] });
            return `✅ Ação executada: Anúncio enviado.`;
        }

        case "create_role": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const role = await guild.roles.create({ name: args.name, color: args.color || null }).catch(()=>null);
            if (!role) return "❌ Falha ao criar cargo.";
            return `✅ Ação executada: Cargo '${role.name}' criado.`;
        }

        case "delete_role": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const roleName = args.role_name.replace(/<@&|>/g, '');
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase() || r.id === roleName);
            if (!role || role.position >= botMember.roles.highest.position) return "❌ Falha: Cargo não encontrado ou muito alto.";
            await role.delete();
            return `✅ Ação executada: Cargo deletado.`;
        }

        case "add_role_to_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === args.role_name.toLowerCase() || r.id === args.role_name.replace(/<@&|>/g, ''));
            if (!member || !role || role.position >= botMember.roles.highest.position) return "❌ Falha ao dar cargo.";
            await member.roles.add(role);
            return `✅ Ação executada: Cargo adicionado.`;
        }

        case "remove_role_from_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === args.role_name.toLowerCase() || r.id === args.role_name.replace(/<@&|>/g, ''));
            if (!member || !role || role.position >= botMember.roles.highest.position) return "❌ Falha ao remover cargo.";
            await member.roles.remove(role);
            return `✅ Ação executada: Cargo removido.`;
        }

        case "create_category": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            const cat = await guild.channels.create({ name: args.name, type: 4 }); // 4 is GUILD_CATEGORY
            return `✅ Ação executada: Categoria '${cat.name}' criada.`;
        }

        case "move_channel_to_category": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!channel || !category) return "❌ Falha: Canal ou Categoria não encontrados.";
            await channel.setParent(category.id);
            return `✅ Ação executada: Canal movido.`;
        }

        case "lock_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha: Canal não encontrado.";
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
            return `✅ Ação executada: Canal <#${channel.id}> trancado.`;
        }

        case "unlock_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha: Canal não encontrado.";
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: null });
            return `✅ Ação executada: Canal <#${channel.id}> destrancado.`;
        }

        case "change_nickname": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return "❌ Falha: Sem permissão.";
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member || member.roles.highest.position >= botMember.roles.highest.position) return "❌ Falha ao alterar nick.";
            const newNick = args.new_nickname === 'reset' || args.new_nickname === '' ? null : args.new_nickname;
            await member.setNickname(newNick);
            return `✅ Ação executada: Apelido alterado.`;
        }

        case "send_dm": {
            const targetId = extractId(args.user_id);
            const member = await guild.members.fetch(targetId).catch(() => null);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            await member.send(args.content).catch(() => { return "❌ Falha: Usuário tem as DMs bloqueadas."; });
            return `✅ Ação executada: DM enviada.`;
        }

        case "create_emoji": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return "❌ Falha: Sem permissão (Emojis).";
            const emoji = await guild.emojis.create({ attachment: args.image_url, name: args.name }).catch(()=>null);
            if (!emoji) return "❌ Falha: Não foi possível criar o emoji (URL inválida ou limite atingido).";
            return `✅ Ação executada: Emoji ${emoji} criado.`;
        }

        case "delete_emoji": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return "❌ Falha: Sem permissão (Emojis).";
            const emoji = guild.emojis.cache.find(e => e.name === args.emoji_name || e.id === args.emoji_name);
            if (!emoji) return "❌ Falha: Emoji não encontrado.";
            await emoji.delete();
            return `✅ Ação executada: Emoji deletado.`;
        }

        case "change_server_name": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return "❌ Falha: Sem permissão (Gerenciar Servidor).";
            await guild.setName(args.new_name);
            return `✅ Ação executada: Nome do servidor alterado para ${args.new_name}.`;
        }

        case "create_invite": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) return "❌ Falha: Sem permissão de Convite.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha: Canal não encontrado.";
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            return `✅ Ação executada: Link gerado: ${invite.url}`;
        }

        default:
            return `❌ Ferramenta desconhecida solicitada pela IA: ${name}`;
    }
}

module.exports = {
    geminiTools,
    executeTool
};
