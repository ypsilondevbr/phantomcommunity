const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const jokes = [
    "Por que o computador foi ao médico? Porque estava com vírus!",
    "Qual o cúmulo da força? Dobrar a esquina!",
    "O que o zero disse para o oito? Que cinto maneiro!",
    "Como o Batman faz para entrar na Bat-caverna? Ele bate-palma!",
    "Por que o livro de matemática se suicidou? Porque tinha muitos problemas.",
    "Qual a fruta que anda de trem? O ki-wi.",
    "O que é um pontinho amarelo na limusine? Um milhonário.",
    "Qual a cidade brasileira que não tem táxi? Uberlândia.",
    "O que o pato disse para a pata? Vem Quá!",
    "Por que a água foi presa? Porque matou a sede.",
    "Por que a velhinha não usa relógio? Porque ela não tem tempo a perder.",
    "Como se faz para ganhar um chokito? É só colocar o dedito na tomodita.",
    "O que um cromossomo disse pro outro? Cromossomos felizes!",
    "Qual o animal que não vale mais nada? O javali.",
    "Qual é a comida que liga e desliga? O strogon-off.",
    "Por que o pinheiro não se perde na floresta? Porque ele tem uma pinha.",
    "Qual o peixe que caiu do 10º andar? Aaaatum.",
    "Como o elefante se suicida? Ele enfia a tromba no bumbum e assopra.",
    "Por que a mulher do Hulk se divorciou dele? Porque ela queria um homem mais maduro.",
    "Qual a diferença entre a lagoa e a padaria? Na lagoa há sapinho, na padaria assa pão.",
    "Por que o jacaré tirou o filho da escola? Porque ele réptil de ano.",
    "Como a bruxa sai na chuva? De rodo.",
    "Qual o nome do carro do ovo? O Fiesta.",
    "Por que a galinha bateu a cabeça na parede? Para ficar com o galo.",
    "O que o tijolo disse pro outro? Há um ciúme entre nós.",
    "Como se chama a mulher do homem de ferro? Mulher de passar.",
    "Qual o cachorro que é mágico? O labracadabrador.",
    "Por que o mudo não foi ao cinema? Porque o filme era dublado.",
    "O que a areia disse pro mar? Deixa de onda.",
    "Qual o estado brasileiro que quer ser carro? Ser-jipe.",
    "O que o tomate foi fazer no banco? Tirar o extrato.",
    "Por que o policial não usa sabão? Porque ele prefere deter-gente.",
    "Qual é o café que é muito rápido? O café expresso.",
    "Por que o menino jogou o relógio pela janela? Porque ele queria ver o tempo voar.",
    "Qual é o dente que mais dói? O dente-frito.",
    "Qual é o fim da picada? Quando o mosquito vai embora.",
    "Por que a plantinha não pode ir ao médico? Porque no hospital só tem planta de plantão.",
    "Como se faz uma omelete sem ovos? Batendo a cabeça na parede.",
    "O que o pintinho caipira disse pro pintinho da cidade? Piu, sô!",
    "Qual o carro que mostra o caminho? O Ford Ka.",
    "O que a vaca foi fazer no espaço? Foi ver a via láctea.",
    "Por que o esqueleto não brigou com ninguém? Porque ele não tem estômago para isso.",
    "Qual o peixe que cai do céu? A chuva de prata.",
    "Por que a tartaruga não usa chapéu? Para não abafar os pensamentos.",
    "Qual a galinha que cai na porrada? A galinha de briga.",
    "O que um fantasma disse pro outro? Você acredita em pessoas?",
    "Por que o sabão não escorrega? Porque ele usa saboneteira.",
    "Como o sol pede a namorada em casamento? Você quer ser minha es-trela?",
    "Por que a lua não comeu o jantar? Porque ela já estava cheia.",
    "Qual o estado civil da aranha? Solteia.",
    "O que o lápis disse pro papel? Você me deixa sem ponta.",
    "Por que a televisão foi pro espaço? Para ver as estrelas cadentes.",
    "Qual é o super-herói que gosta de macarrão? O Homem-Massa.",
    "Por que o vampiro não come bolo? Porque ele prefere o pescoço.",
    "Qual o passarinho que é feito de pão? O pão-de-ló.",
    "O que a faca disse pra colher? Você não corta nada.",
    "Por que o cachorro não joga basquete? Porque ele tem medo da cesta.",
    "Qual o bicho que não é caro? A barata.",
    "O que a nuvem disse pra chuva? Chove não molha.",
    "Por que o avião não usa óculos? Porque ele já tem janelas."
];

const facts = [
    "O mel nunca estraga. Arqueólogos encontraram mel em tumbas egípcias com mais de 3 mil anos, ainda comestível.",
    "Um dia em Vênus é maior que um ano em Vênus.",
    "Os polvos têm três corações e o sangue deles é azul.",
    "As vacas têm melhores amigas e ficam estressadas quando são separadas.",
    "Bananas são curvadas porque crescem em direção ao sol.",
    "A água-viva Turritopsis dohrnii é biologicamente imortal.",
    "Os ursos polares são, na verdade, negros. O pelo deles é translúcido.",
    "Existem mais árvores na Terra do que estrelas na Via Láctea.",
    "O animal nacional da Escócia é o unicórnio.",
    "As formigas não dormem, apenas tiram 'cochilos' de 1 minuto."
];

const quotes = [
    '"A vida é aquilo que acontece enquanto você faz planos." - John Lennon',
    '"O único lugar onde o sucesso vem antes do trabalho é no dicionário." - Albert Einstein',
    '"A persistência é o caminho do êxito." - Charles Chaplin',
    '"Tudo o que um sonho precisa para ser realizado é alguém que acredite que ele possa ser realizado." - Roberto Shinyashiki',
    '"O sucesso é ir de fracasso em fracasso sem perder o entusiasmo." - Winston Churchill'
];

const compliments = [
    "Seu QI deve ser maior que o do Einstein!",
    "Você é mais brilhante que o Sol!",
    "Se perfeição fosse um crime, você estaria em prisão perpétua.",
    "Seu sorriso ilumina até o lado escuro da Lua.",
    "Você é a exceção à regra de que ninguém é perfeito."
];

const insults = [
    "Se burrice fosse tijolo, você seria a Muralha da China.",
    "Você é a prova de que Deus tem senso de humor.",
    "Acho que você foi feito de peças que sobraram.",
    "Você é como uma nuvem. Quando some, o dia fica lindo.",
    "Seu cérebro está em modo de economia de energia?"
];

async function getGif(category, fallback) {
    try {
        const res = await fetch(`https://api.waifu.pics/sfw/${category}`);
        if (res.ok) {
            const data = await res.json();
            return data.url;
        }
        return fallback;
    } catch {
        return fallback;
    }
}

async function actionEmbed(msg, title, category, fallbackGif) {
    const u = msg.mentions.users.first();
    if(!u) return msg.reply("❌ Mencione alguém!");
    const gif = await getGif(category, fallbackGif);
    return msg.reply({ embeds: [new EmbedBuilder().setDescription(`**<@${msg.author.id}>** ${title} **<@${u.id}>**!`).setImage(gif).setColor('#FF69B4')] });
}

async function soloActionEmbed(msg, desc, category, fallbackGif) {
    const gif = await getGif(category, fallbackGif);
    return msg.reply({ embeds: [new EmbedBuilder().setDescription(`**<@${msg.author.id}>** ${desc}!`).setImage(gif).setColor('#FF69B4')] });
}

const extraCommands = {
    // INFO & UTILS
    ping: (msg) => msg.reply(`🏓 Pong! Latência: ${msg.client.ws.ping}ms`),
    uptime: (msg) => {
        let t = (msg.client.uptime / 1000);
        msg.reply(`⏱️ Estou online há: ${Math.floor(t/86400)}d ${Math.floor((t%86400)/3600)}h ${Math.floor((t%3600)/60)}m ${Math.floor(t%60)}s`);
    },
    avatar: (msg) => {
        const u = msg.mentions.users.first() || msg.author;
        msg.reply({ embeds: [new EmbedBuilder().setTitle(`Avatar de ${u.username}`).setImage(u.displayAvatarURL({ size: 1024 }))] });
    },
    serverinfo: (msg) => msg.reply({ embeds: [new EmbedBuilder().setTitle(msg.guild.name).addFields({name:'Membros', value:`${msg.guild.memberCount}`}, {name:'Dono', value:`<@${msg.guild.ownerId}>`})] }),
    botinfo: (msg) => msg.reply("🤖 **Phantom Community AI**\nBot Híbrido com 51 funções IA + 80 Comandos Clássicos/Fun."),
    roles: (msg) => msg.reply(`🎭 Cargos: ${msg.guild.roles.cache.size}`),
    emojis: (msg) => msg.reply(`😀 Emojis: ${msg.guild.emojis.cache.size}`),
    invite: async (msg) => msg.reply(`🔗 Link: ${(await msg.channel.createInvite({maxAge: 0})).url}`),
    say: (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { msg.delete().catch(()=>{}); msg.channel.send(args.join(' ')); } },
    embed: (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { msg.delete().catch(()=>{}); msg.channel.send({embeds: [new EmbedBuilder().setDescription(args.join(' ')).setColor('#2b2d31')]}); } },
    poll: async (msg, args) => { const m = await msg.channel.send({embeds: [new EmbedBuilder().setTitle("📊 Votação").setDescription(args.join(' ') || "Votação").setColor('#00FFFF')]}); await m.react('👍'); await m.react('👎'); },
    giveaway: async (msg, args) => { const m = await msg.channel.send({embeds: [new EmbedBuilder().setTitle("🎉 SORTEIO!").setDescription(`Prêmio: **${args.join(' ') || "Prêmio"}**\nReaja com 🎉`).setColor('#FF00FF')]}); await m.react('🎉'); },
    math: (msg, args) => { try { msg.reply(`🧮 Resultado: **${eval(args.join('').replace(/[^0-9+\-*/().]/g, ''))}**`); } catch(e) { msg.reply("❌ Erro."); } },
    
    // ROLEPLAY & INTERAÇÕES (GIFs) - Now powered by waifu.pics API for guaranteed gifs!
    slap: async (msg) => await actionEmbed(msg, "deu um tapa ardido em", "slap", "https://i.imgur.com/fm49kMb.gif"),
    hug: async (msg) => await actionEmbed(msg, "deu um abraço quentinho em", "hug", "https://i.imgur.com/r9aU2xv.gif"),
    kiss: async (msg) => await actionEmbed(msg, "deu um beijão em", "kiss", "https://i.imgur.com/sGVgwOU.gif"),
    punch: async (msg) => await actionEmbed(msg, "deu um socão em", "bonk", "https://i.imgur.com/f0EQBQZ.gif"),
    pat: async (msg) => await actionEmbed(msg, "fez carinho em", "pat", "https://i.imgur.com/2lacG7l.gif"),
    kill: async (msg) => await actionEmbed(msg, "assassinou impiedosamente", "kill", "https://i.imgur.com/QhT7873.gif"),
    bite: async (msg) => await actionEmbed(msg, "deu uma mordida em", "bite", "https://i.imgur.com/NOJeKjC.gif"),
    tickle: async (msg) => await actionEmbed(msg, "fez cócegas em", "tickle", "https://i.imgur.com/k2x22b2.gif"),
    poke: async (msg) => await actionEmbed(msg, "cutucou", "poke", "https://i.imgur.com/3ZfP2aG.gif"),
    highfive: async (msg) => await actionEmbed(msg, "bateu as mãos (highfive) com", "highfive", "https://i.imgur.com/lMtbJt0.gif"),
    stare: async (msg) => await actionEmbed(msg, "encarou fixamente", "stare", "https://i.imgur.com/pZqNnK6.gif"),
    cuddle: async (msg) => await actionEmbed(msg, "se aconchegou com", "cuddle", "https://i.imgur.com/x10UfM7.gif"),
    feed: async (msg) => await actionEmbed(msg, "deu comidinha para", "nom", "https://i.imgur.com/1G8VIf1.gif"),
    wave: async (msg) => await soloActionEmbed(msg, "acenou!", "wave", "https://i.imgur.com/rNNO5hI.gif"),
    dance: async (msg) => await soloActionEmbed(msg, "começou a dançar!", "dance", "https://i.imgur.com/3Z4h4d0.gif"),
    cry: async (msg) => await soloActionEmbed(msg, "está chorando...", "cry", "https://i.imgur.com/Xq3xU28.gif"),
    laugh: async (msg) => await soloActionEmbed(msg, "está rindo à toa!", "smile", "https://i.imgur.com/p1J5rL4.gif"),
    blush: async (msg) => await soloActionEmbed(msg, "ficou com vergonha...", "blush", "https://i.imgur.com/n6t3m9k.gif"),
    smug: async (msg) => await soloActionEmbed(msg, "está com um sorriso convencido.", "smug", "https://i.imgur.com/L12s1oD.gif"),
    pout: async (msg) => await soloActionEmbed(msg, "fez bico de irritação.", "pout", "https://i.imgur.com/E5Jz8Q1.gif"),
    confused: async (msg) => await soloActionEmbed(msg, "está muito confuso...", "confused", "https://i.imgur.com/AByF925.gif"),
    angry: async (msg) => await soloActionEmbed(msg, "está furioso!", "angry", "https://i.imgur.com/1N5Wz3V.gif"),
    happy: async (msg) => await soloActionEmbed(msg, "está muito feliz!", "happy", "https://i.imgur.com/oZ8GZ5r.gif"),
    sad: async (msg) => await soloActionEmbed(msg, "está triste...", "cry", "https://i.imgur.com/Xq3xU28.gif"),
    shocked: async (msg) => await soloActionEmbed(msg, "ficou em choque!", "cringe", "https://i.imgur.com/yU4bZ1U.gif"),
    sleep: async (msg) => await soloActionEmbed(msg, "foi dormir...", "sleep", "https://i.imgur.com/G5ZkX1H.gif"),
    bored: async (msg) => await soloActionEmbed(msg, "está morrendo de tédio...", "bored", "https://i.imgur.com/qU3w8eG.gif"),
    wink: async (msg) => await soloActionEmbed(msg, "piscou!", "wink", "https://i.imgur.com/6kYq0V1.gif"),

    // MINIGAMES, MEASURES & ZUEIRAS
    '8ball': (msg) => {
        const answers = ["Sim", "Não", "Talvez", "Com certeza", "Nem pensar", "Pergunte mais tarde", "Tudo aponta que sim"];
        msg.reply(`🎱 ${answers[Math.floor(Math.random() * answers.length)]}`);
    },
    coinflip: (msg) => msg.reply(Math.random() > 0.5 ? "🪙 **Cara!**" : "🪙 **Coroa!**"),
    roll: (msg) => msg.reply(`🎲 Você rolou: **${Math.floor(Math.random() * 6) + 1}**`),
    joke: (msg) => msg.reply(`🤡 ${jokes[Math.floor(Math.random() * jokes.length)]}`),
    dadjoke: (msg) => msg.reply(`🧔 ${jokes[Math.floor(Math.random() * jokes.length)]}`),
    fact: (msg) => msg.reply(`🧠 **Fato:** ${facts[Math.floor(Math.random() * facts.length)]}`),
    quote: (msg) => msg.reply(`📜 ${quotes[Math.floor(Math.random() * quotes.length)]}`),
    compliment: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`💖 <@${u.id}>, ${compliments[Math.floor(Math.random() * compliments.length)]}`); },
    insult: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`🔥 <@${u.id}>, ${insults[Math.floor(Math.random() * insults.length)]}`); },
    rate: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`⭐ Eu dou nota **${Math.floor(Math.random() * 11)}/10** para <@${u.id}>.`); },
    pp: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`🍆 O tamanho do p* de <@${u.id}> é: 8${'='.repeat(Math.floor(Math.random() * 15))}D`); },
    gayrate: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`🏳️‍🌈 A taxa de viadagem de <@${u.id}> é **${Math.floor(Math.random() * 101)}%**!`); },
    simprate: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`🥺 A taxa de gado (simp) de <@${u.id}> é **${Math.floor(Math.random() * 101)}%**!`); },
    iq: (msg) => { const u = msg.mentions.users.first() || msg.author; msg.reply(`🧠 O QI de <@${u.id}> é **${Math.floor(Math.random() * 200) + 10}**!`); },
    marry: (msg) => { const u = msg.mentions.users.first(); if(!u) return msg.reply("Mencione alguém!"); msg.reply(`💍 <@${msg.author.id}> pediu <@${u.id}> em casamento! Será que aceita?`); },
    divorce: (msg) => { const u = msg.mentions.users.first(); if(!u) return msg.reply("Mencione alguém!"); msg.reply(`💔 <@${msg.author.id}> pediu o divórcio para <@${u.id}>. Acabou o amor...`); },
    ship: (msg, args) => { 
        const u = msg.mentions.users.first(); 
        if(!u) return msg.reply("Mencione alguém!"); 
        const chance = Math.floor(Math.random() * 101);
        let barra = '█'.repeat(Math.floor(chance/10)) + '░'.repeat(10 - Math.floor(chance/10));
        msg.reply({ embeds: [new EmbedBuilder().setTitle("💘 Máquina do Amor").setDescription(`A chance de dar namoro entre <@${msg.author.id}> e <@${u.id}> é de:\n\n**${chance}%**\n[${barra}]`).setColor('#FF1493')] });
    },
    hack: async (msg) => {
        const u = msg.mentions.users.first(); if(!u) return msg.reply("Mencione alguém!");
        const m = await msg.channel.send(`💻 Hackeando <@${u.id}>... 0%`);
        setTimeout(() => m.edit(`💻 Hackeando <@${u.id}>... \n[===       ] 30% - Achando endereço IP...`), 1500);
        setTimeout(() => m.edit(`💻 Hackeando <@${u.id}>... \n[======    ] 60% - Roubando fotos da galeria...`), 3000);
        setTimeout(() => m.edit(`💻 Hackeando <@${u.id}>... \n[========= ] 90% - Enviando histórico anônimo pro FBI...`), 4500);
        setTimeout(() => m.edit(`✅ **Hackeamento concluído.** <@${u.id}> perdeu tudo. O IP é: 192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`), 6000);
    },
    reverse: (msg, args) => msg.reply(`🔄 ${args.join(' ').split('').reverse().join('')}`),
    mock: (msg, args) => msg.reply(`🤪 ${args.join(' ').split('').map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join('')}`),
    uwu: (msg, args) => msg.reply(`🌸 ${args.join(' ').replace(/r/g, 'w').replace(/l/g, 'w').replace(/R/g, 'W').replace(/L/g, 'W')} uwu`),
    rps: (msg, args) => {
        const choices = ['pedra', 'papel', 'tesoura'];
        const userChoice = args[0]?.toLowerCase();
        if(!choices.includes(userChoice)) return msg.reply("Use .phantom rps <pedra|papel|tesoura>");
        const botChoice = choices[Math.floor(Math.random() * 3)];
        if(userChoice === botChoice) return msg.reply(`Eu escolhi **${botChoice}**. Empate!`);
        if((userChoice==='pedra'&&botChoice==='tesoura')||(userChoice==='papel'&&botChoice==='pedra')||(userChoice==='tesoura'&&botChoice==='papel'))
            return msg.reply(`Eu escolhi **${botChoice}**. Você GANHOU! 🎉`);
        return msg.reply(`Eu escolhi **${botChoice}**. Você PERDEU! 😈`);
    },
    meme: async (msg) => {
        try {
            const res = await fetch("https://meme-api.com/gimme");
            const data = await res.json();
            msg.reply({ embeds: [new EmbedBuilder().setTitle(data.title).setImage(data.url).setColor('#FFD700')] });
        } catch {
            msg.reply("😂 Erro ao buscar meme... mas o importante é rir.");
        }
    },

    // MODERATION & ADMIN (Legacy)
    unban: async (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) msg.guild.members.unban(args[0]).then(()=> msg.reply("✅ Desbanido.")).catch(()=>{}); },
    untimeout: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) msg.mentions.members.first()?.timeout(null).then(()=> msg.reply("✅ Castigo removido.")).catch(()=>{}); },
    lock: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) { await msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: false }); msg.reply("🔒 Canal trancado."); } },
    unlock: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) { await msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: null }); msg.reply("🔓 Canal destrancado."); } },
    slowmode: async (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) { await msg.channel.setRateLimitPerUser(parseInt(args[0]) || 0); msg.reply(`⏳ Slowmode alterado.`); } },
    clear: async (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { await msg.channel.bulkDelete(parseInt(args[0]), true); msg.channel.send(`🧹 Limpo.`).then(m => setTimeout(()=>m.delete(), 3000)); } },
    nuke: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) { const pos = msg.channel.position; const n = await msg.channel.clone(); await msg.channel.delete(); await n.setPosition(pos); n.send("☢️ Nukado!"); } },
    mute: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) msg.mentions.members.first()?.voice.setMute(true).then(()=>msg.reply("✅ Mutado")).catch(()=>{}); },
    unmute: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) msg.mentions.members.first()?.voice.setMute(false).then(()=>msg.reply("✅ Desmutado")).catch(()=>{}); },
    deafen: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) msg.mentions.members.first()?.voice.setDeaf(true).then(()=>msg.reply("✅ Ensurdecido")).catch(()=>{}); },
    undeafen: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) msg.mentions.members.first()?.voice.setDeaf(false).then(()=>msg.reply("✅ Desensurdecido")).catch(()=>{}); },
    disconnect: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) msg.mentions.members.first()?.voice.disconnect().then(()=>msg.reply("✅ Derrubado")).catch(()=>{}); },
    move: async (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) msg.mentions.members.first()?.voice.setChannel(args[1]?.replace(/<#|>/g, '')).then(()=>msg.reply("✅ Movido")).catch(()=>{}); },
    addrole: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) msg.mentions.members.first()?.roles.add(msg.mentions.roles.first()).then(()=>msg.reply("✅ Adicionado")).catch(()=>{}); },
    removerole: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) msg.mentions.members.first()?.roles.remove(msg.mentions.roles.first()).then(()=>msg.reply("✅ Removido")).catch(()=>{}); },
    lockdown: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) { msg.guild.channels.cache.forEach(c => { if(c.type === 0) c.permissionOverwrites.edit(msg.guild.id, { SendMessages: false }).catch(()=>{}); }); msg.reply("🔒 LOCKDOWN ATIVADO."); } },
    unlockdown: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) { msg.guild.channels.cache.forEach(c => { if(c.type === 0) c.permissionOverwrites.edit(msg.guild.id, { SendMessages: null }).catch(()=>{}); }); msg.reply("🔓 Lockdown desativado."); } },
    setafk: async (msg) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) { await msg.guild.setAFKChannel(msg.member.voice.channel).catch(()=>{}); msg.reply("💤 AFK setado."); } },
    nick: async (msg, args) => { if (msg.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) msg.mentions.members.first()?.setNickname(args.slice(1).join(' ')).then(()=>msg.reply("✅ Apelido alterado")).catch(()=>{}); }
};

module.exports = extraCommands;
