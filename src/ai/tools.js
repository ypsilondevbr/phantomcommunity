const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logAI } = require('../core/logger');

const geminiTools = [{
    functionDeclarations: [
        { name: "limpar_mensagens", description: "Apaga mensagens", parameters: { type: "OBJECT", properties: { amount: { type: "INTEGER", description: "Quantia" } }, required: ["amount"] } },
        { name: "expulsar_membro", description: "Expulsa usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID/Menção" }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id"] } },
        { name: "banir_membro", description: "Bane usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID/Menção" }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id"] } },
        { name: "castigar_membro", description: "Muta usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING", description: "ID/Menção" }, minutes: { type: "INTEGER", description: "Minutos" }, reason: { type: "STRING", description: "Motivo" } }, required: ["user_id", "minutes"] } },
        { name: "criar_canal_texto", description: "Cria canal texto", parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Nome" }, topic: { type: "STRING", description: "Tópico" } }, required: ["name"] } },
        { name: "deletar_canal", description: "Deleta canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Nome/Menção do canal" } }, required: ["channel_name"] } },
        { name: "enviar_anuncio", description: "Envia Embed", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, title: { type: "STRING" }, description: { type: "STRING" } }, required: ["channel_name", "title", "description"] } },
        { name: "criar_cargo", description: "Cria cargo", parameters: { type: "OBJECT", properties: { name: { type: "STRING" }, color: { type: "STRING", description: "Hex" } }, required: ["name"] } },
        { name: "deletar_cargo", description: "Deleta cargo", parameters: { type: "OBJECT", properties: { role_name: { type: "STRING", description: "Nome/ID" } }, required: ["role_name"] } },
        { name: "editar_cargo", description: "Edita cargo", parameters: { type: "OBJECT", properties: { role_name: { type: "STRING", description: "Nome/ID" }, new_name: { type: "STRING" }, new_color: { type: "STRING" } }, required: ["role_name"] } },
        { name: "dar_cargo_membro", description: "Dá cargo", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, role_name: { type: "STRING" } }, required: ["user_id", "role_name"] } },
        { name: "tirar_cargo_membro", description: "Tira cargo", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, role_name: { type: "STRING" } }, required: ["user_id", "role_name"] } },
        { name: "criar_categoria", description: "Cria categoria", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] } },
        { name: "mover_canal_categoria", description: "Move canal pra categoria", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, category_name: { type: "STRING" } }, required: ["channel_name", "category_name"] } },
        { name: "trancar_canal", description: "Tranca canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "destrancar_canal", description: "Destranca canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "mudar_apelido", description: "Muda apelido", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, new_nickname: { type: "STRING" } }, required: ["user_id", "new_nickname"] } },
        { name: "enviar_dm", description: "Envia DM", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, content: { type: "STRING" } }, required: ["user_id", "content"] } },
        { name: "criar_emoji", description: "Cria emoji", parameters: { type: "OBJECT", properties: { name: { type: "STRING" }, image_url: { type: "STRING" } }, required: ["name", "image_url"] } },
        { name: "deletar_emoji", description: "Deleta emoji", parameters: { type: "OBJECT", properties: { emoji_name: { type: "STRING" } }, required: ["emoji_name"] } },
        { name: "mudar_nome_servidor", description: "Muda nome sv", parameters: { type: "OBJECT", properties: { new_name: { type: "STRING" } }, required: ["new_name"] } },
        { name: "criar_convite", description: "Cria convite", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING", description: "Opcional" } }, required: [] } },
        { name: "ensurdecer_membro", description: "Ensurdece membro na call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "desensurdecer_membro", description: "Tira ensurdecimento", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "mutar_membro_call", description: "Muta microfone na call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "desmutar_membro_call", description: "Desmuta microfone", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "mover_membro_call", description: "Move membro pra outra call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, voice_channel_name: { type: "STRING" } }, required: ["user_id", "voice_channel_name"] } },
        { name: "derrubar_membro_call", description: "Derruba da call", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "fixar_mensagem", description: "Fixa última mensagem", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: [] } },
        { name: "desfixar_mensagem", description: "Desfixa última mensagem", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: [] } },
        { name: "modo_lento", description: "Ativa slowmode", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, seconds: { type: "INTEGER" } }, required: ["seconds"] } },
        { name: "limpar_canal_nuke", description: "Apaga tudo de um canal clonando", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "editar_topico_canal", description: "Edita topico do canal", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, new_topic: { type: "STRING" } }, required: ["channel_name", "new_topic"] } },
        { name: "criar_topico_thread", description: "Cria thread (tópico)", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, name: { type: "STRING" } }, required: ["name"] } },
        { name: "deletar_topico_thread", description: "Deleta thread", parameters: { type: "OBJECT", properties: { thread_name: { type: "STRING" } }, required: ["thread_name"] } },
        { name: "trancar_topico_thread", description: "Tranca thread", parameters: { type: "OBJECT", properties: { thread_name: { type: "STRING" } }, required: ["thread_name"] } },
        { name: "destrancar_topico_thread", description: "Destranca thread", parameters: { type: "OBJECT", properties: { thread_name: { type: "STRING" } }, required: ["thread_name"] } },
        { name: "tirar_castigo_membro", description: "Tira castigo antecipado", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "desbanir_membro", description: "Desbane usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" } }, required: ["user_id"] } },
        { name: "renomear_categoria", description: "Renomeia categoria", parameters: { type: "OBJECT", properties: { category_name: { type: "STRING" }, new_name: { type: "STRING" } }, required: ["category_name", "new_name"] } },
        { name: "deletar_categoria", description: "Deleta categoria vazia", parameters: { type: "OBJECT", properties: { category_name: { type: "STRING" } }, required: ["category_name"] } },
        { name: "criar_sorteio", description: "Cria sorteio", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, prize: { type: "STRING" } }, required: ["channel_name", "prize"] } },
        // NOVAS 9 FERRAMENTAS FINAIS DO PROTOCOLO DEUS EX MACHINA
        { name: "criar_canal_voz", description: "Cria um canal de voz (call)", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] } },
        { name: "criar_canal_anuncio", description: "Cria um canal do tipo Anúncios (megafone)", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] } },
        { name: "criar_canal_palco", description: "Cria um canal do tipo Palco (Stage)", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] } },
        { name: "clonar_canal", description: "Faz uma cópia exata de um canal (mantendo ambos)", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "limpar_bans", description: "PERIGOSO: Desbane absolutamente todos os usuários", parameters: { type: "OBJECT", properties: {}, required: [] } },
        { name: "criar_cargo_admin", description: "PERIGOSO: Cria cargo com Admin verdadeiro e dá para o usuário", parameters: { type: "OBJECT", properties: { user_id: { type: "STRING" }, role_name: { type: "STRING", description: "Nome do cargo admin" } }, required: ["user_id", "role_name"] } },
        { name: "enviar_mensagem_embed_avancado", description: "Cria um Embed super complexo e cheio de detalhes", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" }, title: { type: "STRING" }, desc: { type: "STRING" }, color: { type: "STRING" }, image_url: { type: "STRING" }, thumbnail_url: { type: "STRING" }, footer: { type: "STRING" } }, required: ["channel_name", "title", "desc"] } },
        { name: "set_canal_afk", description: "Define o canal de voz AFK do servidor", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } },
        { name: "set_canal_regras", description: "Define o canal de Regras oficial da Guilda", parameters: { type: "OBJECT", properties: { channel_name: { type: "STRING" } }, required: ["channel_name"] } }
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
        case "limpar_mensagens": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) return "❌ Falha: Bot sem permissão de 'Gerenciar Mensagens'.";
            let amount = args.amount;
            if (amount < 1 || amount > 100) return "❌ Falha: Quantidade deve ser entre 1 e 100.";
            await message.channel.bulkDelete(amount, true).catch(() => {});
            return `✅ Ação executada: ${amount} mensagens apagadas.`;
        }
        case "expulsar_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.kickable) return "❌ Falha.";
            await member.kick(args.reason || "Decisão da IA");
            return `✅ Ação executada: Usuário expulso.`;
        }
        case "banir_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.bannable) return "❌ Falha.";
            await member.ban({ reason: args.reason || "Decisão da IA" });
            return `✅ Ação executada: Usuário banido.`;
        }
        case "castigar_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member) return "❌ Falha.";
            await member.timeout(args.minutes * 60 * 1000, args.reason || "Decisão da IA");
            return `✅ Ação executada: Usuário mutado.`;
        }
        case "criar_canal_texto": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            const channel = await guild.channels.create({ name: args.name, type: 0, topic: args.topic || "" });
            return `✅ Ação executada: Canal <#${channel.id}> criado.`;
        }
        case "deletar_canal": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.delete();
            return `✅ Ação executada: Canal deletado.`;
        }
        case "enviar_anuncio": {
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const embed = new EmbedBuilder().setTitle(args.title).setDescription(args.description).setColor(0x00FF00);
            await channel.send({ embeds: [embed] });
            return `✅ Ação executada: Anúncio enviado.`;
        }
        case "criar_cargo": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha.";
            let opts = { name: args.name };
            if (args.color) opts.color = args.color;
            const role = await guild.roles.create(opts).catch(()=>null);
            if (!role) return "❌ Falha.";
            return `✅ Ação executada: Cargo '${role.name}' criado.`;
        }
        case "deletar_cargo": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha.";
            const roleName = args.role_name.replace(/<@&|>/g, '');
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase() || r.id === roleName);
            if (!role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            await role.delete();
            return `✅ Ação executada: Cargo deletado.`;
        }
        case "editar_cargo": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha.";
            const roleName = args.role_name.replace(/<@&|>/g, '');
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase() || r.id === roleName);
            if (!role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            let updates = {};
            if (args.new_name) updates.name = args.new_name;
            if (args.new_color) updates.color = args.new_color;
            await role.edit(updates).catch(()=>null);
            return `✅ Ação executada: Cargo editado.`;
        }
        case "dar_cargo_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === args.role_name.toLowerCase() || r.id === args.role_name.replace(/<@&|>/g, ''));
            if (!member || !role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            await member.roles.add(role);
            return `✅ Ação executada: Cargo adicionado.`;
        }
        case "tirar_cargo_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            let role = guild.roles.cache.find(r => r.name.toLowerCase() === args.role_name.toLowerCase() || r.id === args.role_name.replace(/<@&|>/g, ''));
            if (!member || !role || role.position >= botMember.roles.highest.position) return "❌ Falha.";
            await member.roles.remove(role);
            return `✅ Ação executada: Cargo removido.`;
        }
        case "criar_categoria": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            const cat = await guild.channels.create({ name: args.name, type: 4 });
            return `✅ Ação executada: Categoria criada.`;
        }
        case "mover_canal_categoria": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!channel || !category) return "❌ Falha.";
            await channel.setParent(category.id);
            return `✅ Ação executada: Canal movido.`;
        }
        case "trancar_canal": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
            return `✅ Ação executada: Canal trancado.`;
        }
        case "destrancar_canal": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: null });
            return `✅ Ação executada: Canal destrancado.`;
        }
        case "mudar_apelido": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || member.roles.highest.position >= botMember.roles.highest.position) return "❌ Falha.";
            const newNick = args.new_nickname === 'reset' || args.new_nickname === '' ? null : args.new_nickname;
            await member.setNickname(newNick);
            return `✅ Ação executada: Apelido alterado.`;
        }
        case "enviar_dm": {
            const member = await findMember(args.user_id);
            if (!member) return "❌ Falha.";
            await member.send(args.content).catch(() => { return "❌ Falha (DM trancada)."; });
            return `✅ Ação executada: DM enviada.`;
        }
        case "criar_emoji": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return "❌ Falha.";
            const emoji = await guild.emojis.create({ attachment: args.image_url, name: args.name }).catch(()=>null);
            if (!emoji) return "❌ Falha.";
            return `✅ Ação executada: Emoji criado.`;
        }
        case "deletar_emoji": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return "❌ Falha.";
            const emoji = guild.emojis.cache.find(e => e.name === args.emoji_name || e.id === args.emoji_name);
            if (!emoji) return "❌ Falha.";
            await emoji.delete();
            return `✅ Ação executada: Emoji deletado.`;
        }
        case "mudar_nome_servidor": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return "❌ Falha.";
            await guild.setName(args.new_name);
            return `✅ Ação executada: Servidor renomeado.`;
        }
        case "criar_convite": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            return `✅ Ação executada: Link gerado: ${invite.url}`;
        }
        case "ensurdecer_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.DeafenMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            await member.voice.setDeaf(true);
            return "✅ Ação executada.";
        }
        case "desensurdecer_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.DeafenMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            await member.voice.setDeaf(false);
            return "✅ Ação executada.";
        }
        case "mutar_membro_call": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MuteMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            await member.voice.setMute(true);
            return "✅ Ação executada.";
        }
        case "desmutar_membro_call": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MuteMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            await member.voice.setMute(false);
            return "✅ Ação executada.";
        }
        case "mover_membro_call": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            let channel = findChannel(args.voice_channel_name);
            if (!channel || channel.type !== 2) return "❌ Falha.";
            await member.voice.setChannel(channel);
            return "✅ Ação executada.";
        }
        case "derrubar_membro_call": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member || !member.voice.channel) return "❌ Falha.";
            await member.voice.disconnect();
            return "✅ Ação executada.";
        }
        case "fixar_mensagem": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const msgs = await channel.messages.fetch({ limit: 1 });
            const msg = msgs.first();
            if (msg) await msg.pin();
            return "✅ Ação executada.";
        }
        case "desfixar_mensagem": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const pinned = await channel.messages.fetchPinned();
            const msg = pinned.first();
            if (msg) await msg.unpin();
            return "✅ Ação executada.";
        }
        case "modo_lento": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.setRateLimitPerUser(args.seconds);
            return `✅ Ação executada.`;
        }
        case "limpar_canal_nuke": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const pos = channel.position;
            const newChannel = await channel.clone();
            await channel.delete();
            await newChannel.setPosition(pos);
            return `✅ Ação executada.`;
        }
        case "editar_topico_canal": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.setTopic(args.new_topic);
            return `✅ Ação executada.`;
        }
        case "criar_topico_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.CreatePublicThreads)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.threads.create({ name: args.name, autoArchiveDuration: 60 });
            return `✅ Ação executada.`;
        }
        case "deletar_topico_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageThreads)) return "❌ Falha.";
            let thread = guild.channels.cache.find(c => c.isThread() && c.name.toLowerCase() === args.thread_name.toLowerCase());
            if (!thread) return "❌ Falha.";
            await thread.delete();
            return `✅ Ação executada.`;
        }
        case "trancar_topico_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageThreads)) return "❌ Falha.";
            let thread = guild.channels.cache.find(c => c.isThread() && c.name.toLowerCase() === args.thread_name.toLowerCase());
            if (!thread) return "❌ Falha.";
            await thread.setLocked(true);
            return `✅ Ação executada.`;
        }
        case "destrancar_topico_thread": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageThreads)) return "❌ Falha.";
            let thread = guild.channels.cache.find(c => c.isThread() && c.name.toLowerCase() === args.thread_name.toLowerCase());
            if (!thread) return "❌ Falha.";
            await thread.setLocked(false);
            return `✅ Ação executada.`;
        }
        case "tirar_castigo_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return "❌ Falha.";
            const member = await findMember(args.user_id);
            if (!member) return "❌ Falha.";
            await member.timeout(null);
            return `✅ Ação executada.`;
        }
        case "desbanir_membro": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha.";
            await guild.members.unban(args.user_id).catch(() => null);
            return `✅ Ação executada.`;
        }
        case "renomear_categoria": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!category) return "❌ Falha.";
            await category.setName(args.new_name);
            return `✅ Ação executada.`;
        }
        case "deletar_categoria": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let category = guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === args.category_name.toLowerCase());
            if (!category) return "❌ Falha.";
            await category.delete();
            return `✅ Ação executada.`;
        }
        case "criar_sorteio": {
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            const embed = new EmbedBuilder().setTitle("🎉 SORTEIO!").setDescription(`Prêmio: **${args.prize}**\nReaja para participar!`).setColor(0xFF00FF);
            const m = await channel.send({ embeds: [embed] });
            await m.react('🎉');
            return `✅ Ação executada.`;
        }
        // 9 NOVAS (DEUS EX MACHINA)
        case "criar_canal_voz": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            const c = await guild.channels.create({ name: args.name, type: 2 });
            return `✅ Canal de voz criado.`;
        }
        case "criar_canal_anuncio": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            const c = await guild.channels.create({ name: args.name, type: 5 }).catch(()=>null);
            if(!c) return "❌ Falha. O servidor precisa ter 'Comunidade' ativada para criar canal de anúncios.";
            return `✅ Canal de anúncios criado.`;
        }
        case "criar_canal_palco": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            const c = await guild.channels.create({ name: args.name, type: 13 }).catch(()=>null);
            if(!c) return "❌ Falha. O servidor precisa ter 'Comunidade' ativada.";
            return `✅ Canal de palco criado.`;
        }
        case "clonar_canal": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await channel.clone();
            return `✅ Canal clonado.`;
        }
        case "limpar_bans": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) return "❌ Falha.";
            const bans = await guild.bans.fetch().catch(()=>null);
            if (!bans) return "❌ Erro ao puxar bans.";
            let count = 0;
            for (const b of bans.values()) {
                await guild.members.unban(b.user.id).catch(()=>{});
                count++;
            }
            return `✅ ${count} usuários desbanidos.`;
        }
        case "criar_cargo_admin": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) return "❌ Bot não tem Administrator nativo para fazer isso.";
            const role = await guild.roles.create({ name: args.role_name, permissions: [PermissionsBitField.Flags.Administrator], color: '#FF0000' }).catch(()=>null);
            if (!role) return "❌ Falha ao criar.";
            const member = await findMember(args.user_id);
            if (member) await member.roles.add(role).catch(()=>{});
            return `✅ Cargo de Admin criado e entregue.`;
        }
        case "enviar_mensagem_embed_avancado": {
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            let embed = new EmbedBuilder().setTitle(args.title).setDescription(args.desc);
            if (args.color) embed.setColor(args.color);
            if (args.image_url) embed.setImage(args.image_url);
            if (args.thumbnail_url) embed.setThumbnail(args.thumbnail_url);
            if (args.footer) embed.setFooter({ text: args.footer });
            await channel.send({ embeds: [embed] }).catch(()=>null);
            return `✅ Embed avançado enviado.`;
        }
        case "set_canal_afk": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel || channel.type !== 2) return "❌ Canal inválido (precisa ser de voz).";
            await guild.setAFKChannel(channel).catch(()=>null);
            await guild.setAFKTimeout(300).catch(()=>null);
            return `✅ Canal AFK definido.`;
        }
        case "set_canal_regras": {
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return "❌ Falha.";
            let channel = findChannel(args.channel_name);
            if (!channel) return "❌ Falha.";
            await guild.setRulesChannel(channel).catch(()=> { return "❌ Servidor precisa ser Comunidade."; });
            return `✅ Canal de regras definido.`;
        }

        default:
            return `❌ Ferramenta desconhecida solicitada pela IA: ${name}`;
    }
}

module.exports = {
    geminiTools,
    executeTool
};
