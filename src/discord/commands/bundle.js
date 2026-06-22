const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const extraCommands = {
    // INFO & UTILS
    ping: (msg) => msg.reply(`🏓 Pong! Latência: ${msg.client.ws.ping}ms`),
    uptime: (msg) => {
        let totalSeconds = (msg.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        msg.reply(`⏱️ Estou online há: ${days}d ${hours}h ${minutes}m ${seconds}s`);
    },
    avatar: (msg, args) => {
        const user = msg.mentions.users.first() || msg.author;
        msg.reply({ embeds: [new EmbedBuilder().setTitle(`Avatar de ${user.username}`).setImage(user.displayAvatarURL({ size: 1024 }))] });
    },
    serverinfo: (msg) => {
        const guild = msg.guild;
        msg.reply({ embeds: [new EmbedBuilder().setTitle(guild.name).addFields(
            {name: 'Membros', value: `${guild.memberCount}`},
            {name: 'Dono', value: `<@${guild.ownerId}>`},
            {name: 'Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:d>`}
        )]});
    },
    botinfo: (msg) => msg.reply("🤖 **Phantom Community AI**\nUm bot híbrido (IA + Comandos Manuais). Desenvolvido para administração avançada."),
    roles: (msg) => msg.reply(`🎭 Cargos do Servidor: ${msg.guild.roles.cache.size}`),
    emojis: (msg) => msg.reply(`😀 Emojis do Servidor: ${msg.guild.emojis.cache.size}`),
    invite: async (msg) => {
        const inv = await msg.channel.createInvite({maxAge: 0});
        msg.reply(`🔗 Convite gerado: ${inv.url}`);
    },
    say: (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const text = args.join(' ');
        if(text) { msg.delete().catch(()=>{}); msg.channel.send(text); }
    },
    embed: (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const text = args.join(' ');
        if(text) { msg.delete().catch(()=>{}); msg.channel.send({embeds: [new EmbedBuilder().setDescription(text).setColor('#2b2d31')]}); }
    },
    poll: async (msg, args) => {
        const text = args.join(' ');
        if(!text) return msg.reply("Uso: .phantom poll <pergunta>");
        const m = await msg.channel.send({embeds: [new EmbedBuilder().setTitle("📊 Votação").setDescription(text).setColor('#00FFFF')]});
        await m.react('👍'); await m.react('👎');
    },
    giveaway: async (msg, args) => {
        const text = args.join(' ');
        if(!text) return msg.reply("Uso: .phantom giveaway <premio>");
        const m = await msg.channel.send({embeds: [new EmbedBuilder().setTitle("🎉 SORTEIO!").setDescription(`Prêmio: **${text}**\nReaja com 🎉 para participar!`).setColor('#FF00FF')]});
        await m.react('🎉');
    },
    math: (msg, args) => {
        try { const result = eval(args.join('').replace(/[^0-9+\-*/().]/g, '')); msg.reply(`🧮 Resultado: **${result}**`); } 
        catch(e) { msg.reply("❌ Expressão inválida!"); }
    },

    // FUN
    '8ball': (msg, args) => {
        const answers = ["Sim", "Não", "Talvez", "Com certeza", "Nem pensar", "Pergunte mais tarde", "Tudo aponta que sim"];
        if(!args[0]) return msg.reply("Faça uma pergunta!");
        msg.reply(`🎱 ${answers[Math.floor(Math.random() * answers.length)]}`);
    },
    coinflip: (msg) => msg.reply(Math.random() > 0.5 ? "🪙 **Cara!**" : "🪙 **Coroa!**"),
    roll: (msg) => msg.reply(`🎲 Você rolou: **${Math.floor(Math.random() * 6) + 1}**`),
    slap: (msg) => { const u = msg.mentions.users.first(); if(u) msg.reply(`👋 <@${msg.author.id}> deu um tapa em <@${u.id}>!`); },
    hug: (msg) => { const u = msg.mentions.users.first(); if(u) msg.reply(`🫂 <@${msg.author.id}> abraçou <@${u.id}>!`); },
    kiss: (msg) => { const u = msg.mentions.users.first(); if(u) msg.reply(`💋 <@${msg.author.id}> beijou <@${u.id}>!`); },
    punch: (msg) => { const u = msg.mentions.users.first(); if(u) msg.reply(`🥊 <@${msg.author.id}> deu um soco em <@${u.id}>!`); },
    pat: (msg) => { const u = msg.mentions.users.first(); if(u) msg.reply(`🐾 <@${msg.author.id}> fez carinho em <@${u.id}>!`); },
    kill: (msg) => { const u = msg.mentions.users.first(); if(u) msg.reply(`💀 <@${msg.author.id}> finalizou <@${u.id}>!`); },
    meme: (msg) => msg.reply("😂 (A imagem de um meme seria enviada aqui)"),
    joke: (msg) => msg.reply("🤡 Por que o elétron atendeu o telefone? Porque era uma chamada de massa!"),

    // MODERATION & ADMIN
    unban: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        const id = args[0]; if(!id) return msg.reply("Mande o ID do usuário.");
        await msg.guild.members.unban(id).then(()=> msg.reply("✅ Desbanido.")).catch(()=> msg.reply("❌ Erro ao desbanir."));
    },
    untimeout: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;
        const u = msg.mentions.members.first(); if(!u) return msg.reply("Mencione alguém.");
        await u.timeout(null).then(()=> msg.reply("✅ Castigo removido.")).catch(()=> msg.reply("❌ Erro."));
    },
    lock: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        await msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: false });
        msg.reply("🔒 Canal trancado.");
    },
    unlock: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        await msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: null });
        msg.reply("🔓 Canal destrancado.");
    },
    slowmode: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        const time = parseInt(args[0]) || 0;
        await msg.channel.setRateLimitPerUser(time);
        msg.reply(`⏳ Slowmode alterado para ${time}s.`);
    },
    clear: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if(!amount || amount < 1 || amount > 100) return msg.reply("Use um número de 1 a 100.");
        await msg.channel.bulkDelete(amount, true);
        msg.channel.send(`🧹 ${amount} mensagens deletadas.`).then(m => setTimeout(()=>m.delete(), 3000));
    },
    nuke: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        const pos = msg.channel.position;
        const newChannel = await msg.channel.clone();
        await msg.channel.delete();
        await newChannel.setPosition(pos);
        newChannel.send("☢️ Canal Nukado!");
    },
    mute: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return;
        const u = msg.mentions.members.first(); if(!u || !u.voice.channel) return;
        await u.voice.setMute(true); msg.reply("✅ Mutado na call.");
    },
    unmute: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return;
        const u = msg.mentions.members.first(); if(!u || !u.voice.channel) return;
        await u.voice.setMute(false); msg.reply("✅ Desmutado.");
    },
    deafen: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) return;
        const u = msg.mentions.members.first(); if(!u || !u.voice.channel) return;
        await u.voice.setDeaf(true); msg.reply("✅ Ensurdecido.");
    },
    undeafen: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) return;
        const u = msg.mentions.members.first(); if(!u || !u.voice.channel) return;
        await u.voice.setDeaf(false); msg.reply("✅ Desensurdecido.");
    },
    disconnect: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) return;
        const u = msg.mentions.members.first(); if(!u || !u.voice.channel) return;
        await u.voice.disconnect(); msg.reply("✅ Derrubado da call.");
    },
    move: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) return;
        const u = msg.mentions.members.first(); 
        const ch = msg.guild.channels.cache.get(args[1]?.replace(/<#|>/g, ''));
        if(!u || !ch) return msg.reply("Mencione um user e um canal.");
        await u.voice.setChannel(ch); msg.reply("✅ Movido.");
    },
    addrole: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;
        const u = msg.mentions.members.first(); 
        const r = msg.mentions.roles.first();
        if(!u || !r) return msg.reply("Mencione user e cargo.");
        await u.roles.add(r).then(()=>msg.reply("✅ Adicionado")).catch(()=>msg.reply("❌ Erro"));
    },
    removerole: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;
        const u = msg.mentions.members.first(); 
        const r = msg.mentions.roles.first();
        if(!u || !r) return msg.reply("Mencione user e cargo.");
        await u.roles.remove(r).then(()=>msg.reply("✅ Removido")).catch(()=>msg.reply("❌ Erro"));
    },
    lockdown: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        msg.guild.channels.cache.forEach(c => {
            if(c.type === 0) c.permissionOverwrites.edit(msg.guild.id, { SendMessages: false }).catch(()=>{});
        });
        msg.reply("🔒 LOCKDOWN ATIVADO NO SERVIDOR TODO.");
    },
    unlockdown: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        msg.guild.channels.cache.forEach(c => {
            if(c.type === 0) c.permissionOverwrites.edit(msg.guild.id, { SendMessages: null }).catch(()=>{});
        });
        msg.reply("🔓 Lockdown desativado.");
    },
    setafk: async (msg) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return;
        const ch = msg.member.voice.channel;
        if(!ch) return msg.reply("Entre num canal de voz primeiro.");
        await msg.guild.setAFKChannel(ch);
        msg.reply("💤 Canal atual setado como AFK.");
    },
    nick: async (msg, args) => {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return;
        const u = msg.mentions.members.first();
        const nick = args.slice(1).join(' ');
        if(!u || !nick) return;
        await u.setNickname(nick).then(()=>msg.reply("✅ Apelido alterado")).catch(()=>msg.reply("❌ Erro"));
    }
};

module.exports = extraCommands;
