const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logAI } = require('../core/logger');

const geminiTools = [{
    functionDeclarations: [
        { name: "clear_messages", description: "Apaga mensagens", parameters: { type: "OBJECT", properties: { amount: { type: "INTEGER", description: "Quantia" } }, required: ["amount"] } },
        { name: "kick_member", description: "Expulsa usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID/Menção" }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id"] } },
        { name: "ban_member", description: "Bane usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID/Menção" }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id"] } },
        { name: "timeout_member", description: "Muta usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID/Menção" }, minutes: { type: "INTEGER", description: "Minutos" }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id", "minutes"] } },
        { name: "create_text_channel", description: "Cria canal texto", parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Nome" }, topic: { type: "STRING", description: "Tópico" } }, required: ["name"] } },
        { name: "delete_channel", description: "Deleta canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome/Menção do canal" } }, required: ["channel_name"] } },
        { name: "send_announcement", description: "Envia Embed", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, title: { type: "STRING" }, description: { type: "STRING" } }, required: ["channel_name", "title", "description"] } },
        { name: "create_role", description: "Cria cargo", parameters: { type: "OBJECT", properties: { name: { type: "STRING" }, color: { type: "STRING", description: "Hex" } }, required: ["name"] } },
        { name: "delete_role", description: "Deleta cargo", parameters: { type: "OBJECT", properties: { role_name: { type: "STRING", description: "Nome/ID" } }, required: ["role_name"] } },
        { name: "edit_role", description: "Edita cargo", parameters: { type: "OBJECT", properties: { role_name: { type: "STRING", description: "Nome/ID" }, new_name: { type: "STRING" }, new_color: { type: "STRING" } }, required: ["role_name"] } },
        { name: "add_role_to_member", description: "Dá cargo", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, role_name: { type: "STRING" } }, required: ["user_id", "role_name"] } },
        { name: "remove_role_from_member", description: "Tira cargo", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, role_name: { type: "STRING" } }, required: ["user_id", "role_name"] } },
        { name: "create_category", description: "Cria categoria", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] } },
        { name: "move_channel_to_category", description: "Move canal pra categoria", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, category_name: { type: "STRING" } }, required: ["channel_name", "category_name"] } },
        { name: "lock_channel", description: "Tranca canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "unlock_channel", description: "Destranca canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "change_nickname", description: "Muda apelido", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, new_nickname: { type: "STRING" } }, required: ["user_id", "new_nickname"] } },
        { name: "send_dm", description: "Envia DM", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, content: { type: "STRING" } }, required: ["user_id", "content"] } },
        { name: "create_emoji", description: "Cria emoji", parameters: { type: "OBJECT", properties: { name: { type: "STRING" }, image_url: { type: "STRING" } }, required: ["name", "image_url"] } },
        { name: "delete_emoji", description: "Deleta emoji", parameters: { type: "OBJECT", properties: { emoji_name: { type: "STRING" } }, required: ["emoji_name"] } },
        { name: "change_server_name", description: "Muda nome sv", parameters: { type: "OBJECT", properties: { new_name: { type: "STRING" } }, required: ["new_name"] } },
        { name: "create_invite", description: "Cria convite", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Opcional" } }, required: [] } },
        // NOVAS 20 FERRAMENTAS:
        { name: "deafen_member", description: "Ensurdece membro na call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "undeafen_member", description: "Tira ensurdecimento", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "mute_member", description: "Muta microfone na call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "unmute_member", description: "Desmuta microfone", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "move_member", description: "Move membro pra outra call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, voice_channel_name: { type: "STRING" } }, required: ["user_id", "voice_channel_name"] } },
        { name: "disconnect_member", description: "Derruba da call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "pin_message", description: "Fixa última mensagem", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: [] } },
        { name: "unpin_message", description: "Desfixa última mensagem", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: [] } },
        { name: "slowmode", description: "Ativa slowmode", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, seconds: { type: "INTEGER" } }, required: ["seconds"] } },
        { name: "clear_channel", description: "Apaga tudo de um canal clonando", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "edit_channel_topic", description: "Edita topico do canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, new_topic: { type: "STRING" } }, required: ["channel_name", "new_topic"] } },
        { name: "create_thread", description: "Cria thread (tópico)", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, name: { type: "STRING" } }, required: ["name"] } },
        { name: "delete_thread", description: "Deleta thread", parameters: { type: "OBJECT", properties: { thread_name: { type: "STRING" } }, required: ["thread_name"] } },
        { name: "lock_thread", description: "Tranca thread", parameters: { type: "OBJECT", properties: { thread_name: { type: "STRING" } }, required: ["thread_name"] } },
        { name: "unlock_thread", description: "Destranca thread", parameters: { type: "OBJECT", properties: { thread_name: { type: "STRING" } }, required: ["thread_name"] } },
        { name: "untimeout_member", description: "Tira castigo antecipado", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "unban_member", description: "Desbane usuário (requer ID, não menção)", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "rename_category", description: "Renomeia categoria", parameters: { type: "OBJECT", properties: { category_name: { type: "STRING" }, new_name: { type: "STRING" } }, required: ["category_name", "new_name"] } },
        { name: "delete_category", description: "Deleta categoria vazia", parameters: { type: "OBJECT", properties: { category_name: { type: "STRING" } }, required: ["category_name"] } },
        { name: "giveaway_create", description: "Cria sorteio simples", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, prize: { type: "STRING" } }, required: ["channel_name", "prize"] } }
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

    const findMember = async (userIdStr) => {
        const id = extractId(userIdStr);
        if (!id) return null;
        return await guild.members.fetch(id).catch(() => null);
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
            const member = await findMember(args.user_id);
            if (!member || !member.kickable) return "❌ Falha: Usuário não encontrado ou inatingível.";
            await member.kick(args.reason || "Decisão da IA");
            return `✅ Ação executada: Usuário expulso.`;
        }
        case "ban_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha: Sem permissão de Ban.";
            const member = await findMember(args.user_id);
            if (!member || !member.bannable) return "❌ Falha: Usuário não encontrado ou inatingível.";
            await member.ban({ reason: args.reason || "Decisão da IA" });
            return `✅ Ação executada: Usuário banido.`;
        }
        case "timeout_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return "❌ Falha: Sem permissão de Timeout.";
            const member = await findMember(args.user_id);
            if (!member) return "❌ Falha: Usuário não encontrado.";
            await member.timeout(args.minutes * 60 * 1000, args.reason || "Decisão da IA");
            return `✅ Ação executada: Usuário mutado.`;
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
            if (!role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            await role.delete();
            return `✅ Ação executada: Cargo deletado.`;
        }
        case "edit_role": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const roleName = args.role_name.replace(/<@&|>/g, '');
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase() || r.id === roleName);
            if (!role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            let updates = {};
            if (args.new_name) updates.name = args.new_name;
            if (args.new_color) updates.color = args.new_color;
            await role.edit(updates).catch(()=>null);
            return `✅ Ação executada: Cargo editado.`;
        }
        case "add_role_to_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const member = await findMember(args.user_id);
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === args.role_name.toLowerCase() || r.id === args.role_name.replace(/<@&|>/g, ''));
            if (!member || !role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            await member.roles.add(role);
            return `✅ Ação executada: Cargo adicionado.`;
        }
        case "remove_role_from_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha: Sem permissão.";
            const member = await findMember(args.user_id);
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === args.role_name.toLowerCase() || r.id === args.role_name.replace(/<@&|>/g, ''));
            if (!member || !role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            await member.roles.remove(role);
            return `✅ Ação executada: Cargo removido.`;
        }
        case "create_category": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            const cat = await guild.channels.create({ name: args.name, type: 4 });
            return `✅ Ação executada: Categoria criada.`;
        }
        case "move_channel_to_category": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!channel || !category) return "❌ Falha.";
            await channel.setParent(category.id);
            return `✅ Ação executada: Canal movido.`;
        }
        case "lock_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
            return `✅ Ação executada: Canal trancado.`;
        }
        case "unlock_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha: Sem permissão.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: null });
            return `✅ Ação executada: Canal destrancado.`;
        }
        case "change_nickname": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return "❌ Falha: Sem permissão.";
            const member = await findMember(args.user_id);
            if (!member || member.roles.highest.position >= botMember.roles.highest.position) return "❌ Falha.";
            const newNick = args.new_nickname === 'reset' || args.new_nickname === '' ? null : args.new_nickname;
            await member.setNickname(newNick);
            return `✅ Ação executada: Apelido alterado.`;
        }
        case "send_dm": {
            const member = await findMember(args.user_id);
            if (!member) return "❌ Falha.";
            await member.send(args.content).catch(() => { return "❌ Falha (DM trancada)."; });
            return `✅ Ação executada: DM enviada.`;
        }
        case "create_emoji": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return "❌ Falha.";
            const emoji = await guild.emojis.create({ attachment: args.image_url, name: args.name }).catch(()=>null);
            if (!emoji) return "❌ Falha.";
            return `✅ Ação executada: Emoji criado.`;
        }
        case "delete_emoji": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return "❌ Falha.";
            const emoji = guild.emojis.cache.find(e => e.name === args.emoji_name || e.id === args.emoji_name);
            if (!emoji) return "❌ Falha.";
            await emoji.delete();
            return `✅ Ação executada: Emoji deletado.`;
        }
        case "change_server_name": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return "❌ Falha.";
            await guild.setName(args.new_name);
            return `✅ Ação executada: Servidor renomeado.`;
        }
        case "create_invite": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            return `✅ Ação executada: Link gerado: ${invite.url}`;
        }
        
        // 20 NOVIDADES:
        case "deafen_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.DeafenMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha (não está na call).";
            await member.voice.setDeaf(true);
            return "✅ Ação executada: Usuário ensurdecido.";
        }
        case "undeafen_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.DeafenMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha (não está na call).";
            await member.voice.setDeaf(false);
            return "✅ Ação executada: Usuário não está mais ensurdecido.";
        }
        case "mute_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MuteMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha (não está na call).";
            await member.voice.setMute(true);
            return "✅ Ação executada: Usuário mutado.";
        }
        case "unmute_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MuteMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha (não está na call).";
            await member.voice.setMute(false);
            return "✅ Ação executada: Usuário desmutado.";
        }
        case "move_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            let channel = findChannel(args.voice_channel_name);
            if (!channel || channel.type !== 2) return "❌ Canal de voz inválido.";
            await member.voice.setChannel(channel);
            return "✅ Ação executada: Usuário movido.";
        }
        case "disconnect_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            await member.voice.disconnect();
            return "✅ Ação executada: Usuário derrubado da call.";
        }
        case "pin_message": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const msgs = await channel.messages.fetch({ limit: 1 });
            const msg = msgs.first();
            if (msg) await msg.pin();
            return "✅ Ação executada: Mensagem fixada.";
        }
        case "unpin_message": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const pinned = await channel.messages.fetchPinned();
            const msg = pinned.first();
            if (msg) await msg.unpin();
            return "✅ Ação executada: Mensagem desfixada.";
        }
        case "slowmode": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.setRateLimitPerUser(args.seconds);
            return `✅ Ação executada: Slowmode setado para ${args.seconds}s.`;
        }
        case "clear_channel": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const pos = channel.position;
            const newChannel = await channel.clone();
            await channel.delete();
            await newChannel.setPosition(pos);
            return `✅ Ação executada: Canal 'Nuked'.`;
        }
        case "edit_channel_topic": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.setTopic(args.new_topic);
            return `✅ Ação executada: Tópico editado.`;
        }
        case "create_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.CreatePublicThreads)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.threads.create({ name: args.name, autoArchiveDuration: 60 });
            return `✅ Ação executada: Thread criada.`;
        }
        case "delete_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageThreads)) return "❌ Falha.";
            let thread = guild.channels.cache.find(c => c.isThread() && c.name.toLowerCase() === args.thread_name.toLowerCase());
            if (!thread) return "❌ Falha.";
            await thread.delete();
            return `✅ Ação executada: Thread deletada.`;
        }
        case "lock_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageThreads)) return "❌ Falha.";
            let thread = guild.channels.cache.find(c => c.isThread() && c.name.toLowerCase() === args.thread_name.toLowerCase());
            if (!thread) return "❌ Falha.";
            await thread.setLocked(true);
            return `✅ Ação executada: Thread trancada.`;
        }
        case "unlock_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageThreads)) return "❌ Falha.";
            let thread = guild.channels.cache.find(c => c.isThread() && c.name.toLowerCase() === args.thread_name.toLowerCase());
            if (!thread) return "❌ Falha.";
            await thread.setLocked(false);
            return `✅ Ação executada: Thread destrancada.`;
        }
        case "untimeout_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member) return "❌ Falha.";
            await member.timeout(null);
            return `✅ Ação executada: Castigo removido.`;
        }
        case "unban_member": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha.";
            await guild.members.unban(args.user_id).catch(() => null);
            return `✅ Ação executada: Usuário desbanido.`;
        }
        case "rename_category": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!category) return "❌ Falha.";
            await category.setName(args.new_name);
            return `✅ Ação executada: Categoria renomeada.`;
        }
        case "delete_category": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!category) return "❌ Falha.";
            await category.delete();
            return `✅ Ação executada: Categoria deletada.`;
        }
        case "giveaway_create": {
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const embed = new EmbedBuilder().setTitle("🎉 SORTEIO!").setDescription(`Prêmio: **${args.prize}**\nReaja para participar!`).setColor(0xFF00FF);
            const m = await channel.send({ embeds: [embed] });
            await m.react('🎉');
            return `✅ Ação executada: Sorteio criado.`;
        }

        default:
            return `❌ Ferramenta desconhecida solicitada pela IA: ${name}`;
    }
}

module.exports = {
    geminiTools,
    executeTool
};
