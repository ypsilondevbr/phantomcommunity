const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// Utility to create a button
function createBtn(id, label, style = ButtonStyle.Primary) {
    return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}

const minigames = {
    // 1. Jogo da Velha (Tic Tac Toe)
    tictactoe: async (msg) => {
        const p1 = msg.author;
        const p2 = msg.mentions.users.first();
        if(!p2 || p1.id === p2.id) return msg.reply("Mencione outro jogador!");
        let board = Array(9).fill('➖');
        let turn = p1.id;
        const winStates = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        
        const buildGrid = () => {
            const rows = [];
            for(let i=0; i<3; i++) {
                const row = new ActionRowBuilder();
                for(let j=0; j<3; j++) {
                    const idx = i*3+j;
                    row.addComponents(new ButtonBuilder().setCustomId(`ttt_${idx}`).setLabel(board[idx]).setStyle(board[idx]==='➖' ? ButtonStyle.Secondary : (board[idx]==='❌' ? ButtonStyle.Danger : ButtonStyle.Success)).setDisabled(board[idx]!=='➖'));
                }
                rows.push(row);
            }
            return rows;
        };

        const m = await msg.channel.send({ content: `**Jogo da Velha**\nVez de: <@${turn}>`, components: buildGrid() });
        const col = m.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        
        col.on('collect', async i => {
            if(i.user.id !== turn) return i.reply({ content: "Não é sua vez!", ephemeral: true });
            const idx = parseInt(i.customId.split('_')[1]);
            board[idx] = turn === p1.id ? '❌' : '⭕';
            
            let won = false;
            for(let w of winStates) {
                if(board[w[0]]!=='➖' && board[w[0]]===board[w[1]] && board[w[1]]===board[w[2]]) won = true;
            }
            
            if(won) {
                await i.update({ content: `🎉 **<@${turn}> VENCEU O JOGO DA VELHA!**`, components: buildGrid() });
                return col.stop();
            }
            if(!board.includes('➖')) {
                await i.update({ content: `🤝 **DEU VELHA! EMPATE!**`, components: buildGrid() });
                return col.stop();
            }
            
            turn = turn === p1.id ? p2.id : p1.id;
            await i.update({ content: `**Jogo da Velha**\nVez de: <@${turn}>`, components: buildGrid() });
        });
    },

    // 2. Duelo de Armas (Gunfight)
    gunfight: async (msg) => {
        const p2 = msg.mentions.users.first();
        if(!p2 || msg.author.id === p2.id) return msg.reply("Mencione um adversário!");
        const m = await msg.channel.send(`🤠 O duelo entre <@${msg.author.id}> e <@${p2.id}> vai começar... Preparar...`);
        const delay = Math.floor(Math.random() * 5000) + 2000;
        
        setTimeout(async () => {
            const row = new ActionRowBuilder().addComponents(createBtn('shoot', '🔫 ATIRAR!', ButtonStyle.Danger));
            await m.edit({ content: `**ATIRE AGORA!**`, components: [row] });
            const filter = i => i.user.id === msg.author.id || i.user.id === p2.id;
            m.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 10000 })
                .then(i => {
                    i.update({ content: `💥 **<@${i.user.id}> atirou primeiro e venceu o duelo!**`, components: [] });
                }).catch(() => m.edit({ content: `😴 Os dois dormiram no ponto. Empate.`, components: [] }));
        }, delay);
    },

    // 3. Forca (Hangman)
    hangman: async (msg) => {
        const words = ['DISCORD', 'PHANTOM', 'GALAXY', 'COMPUTADOR', 'ASTRONAUTA', 'TECLADO'];
        const word = words[Math.floor(Math.random() * words.length)];
        let guessed = [];
        let wrong = 0;
        const maxWrong = 6;
        
        const render = () => `Forca: ${wrong}/${maxWrong} erros\nPalavra: \`${word.split('').map(c => guessed.includes(c) ? c : '_').join(' ')}\``;
        
        const m = await msg.channel.send(render() + "\nDigite uma letra no chat!");
        const filter = m_ => m_.author.id === msg.author.id && m_.content.length === 1 && m_.content.match(/[a-z]/i);
        const col = msg.channel.createMessageCollector({ filter, time: 60000 });
        
        col.on('collect', m_ => {
            const letter = m_.content.toUpperCase();
            if(!guessed.includes(letter)) {
                guessed.push(letter);
                if(!word.includes(letter)) wrong++;
            }
            if(wrong >= maxWrong) {
                m.edit(`💀 **VOCÊ FOI ENFORCADO!** A palavra era: ${word}`);
                return col.stop();
            }
            if(word.split('').every(c => guessed.includes(c))) {
                m.edit(`🎉 **VOCÊ SOBREVIVEU!** A palavra era: ${word}`);
                return col.stop();
            }
            m.edit(render() + "\nContinue digitando letras!");
        });
    },

    // 4. Roleta Russa Clássica
    russianroulette: async (msg) => {
        const bullet = Math.floor(Math.random() * 6);
        let current = 0;
        const row = new ActionRowBuilder().addComponents(createBtn('pull', '🔫 Puxar Gatilho', ButtonStyle.Danger));
        const m = await msg.reply({ content: `A arma tem 1 bala e 6 espaços. Quem vai puxar o gatilho?`, components: [row] });
        
        const col = m.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        col.on('collect', async i => {
            if(current === bullet) {
                await i.update({ content: `💥 **BAM!** <@${i.user.id}> levou um tiro e morreu!`, components: [] });
                return col.stop();
            } else {
                current++;
                await i.update({ content: `*Click.* <@${i.user.id}> sobreviveu. Próximo! (${current}/6 espaços)`, components: [row] });
            }
        });
    },

    // 5. Slots (Caça-Níquel)
    slots: async (msg) => {
        const emojis = ['🍎', '🍒', '🍇', '🔔', '💎', '7️⃣'];
        const r = () => emojis[Math.floor(Math.random() * emojis.length)];
        const res = [r(), r(), r()];
        const win = res[0] === res[1] && res[1] === res[2];
        const m = await msg.reply("🎰 **Girando...**");
        setTimeout(() => {
            m.edit(`🎰 **SLOTS** 🎰\n[ ${res.join(' | ')} ]\n${win ? "🎉 **JACKPOT! Você ganhou!**" : "❌ **Você perdeu!**"}`);
        }, 1500);
    },

    // 6. Fast Click
    fastclick: async (msg) => {
        const m = await msg.channel.send("Aguarde o botão aparecer...");
        const delay = Math.floor(Math.random() * 4000) + 2000;
        setTimeout(async () => {
            const row = new ActionRowBuilder().addComponents(createBtn('click', 'CLIQUE!', ButtonStyle.Success));
            const start = Date.now();
            await m.edit({ content: "🚨 **AGORA!**", components: [row] });
            m.awaitMessageComponent({ componentType: ComponentType.Button, time: 10000 })
                .then(i => {
                    const time = Date.now() - start;
                    i.update({ content: `⚡ <@${i.user.id}> clicou em **${time}ms**!`, components: [] });
                }).catch(() => m.edit({ content: "Lentos demais... botão expirou.", components: [] }));
        }, delay);
    },

    // 7. Math Quiz
    mathquiz: async (msg) => {
        const n1 = Math.floor(Math.random() * 50);
        const n2 = Math.floor(Math.random() * 50);
        const ans = n1 + n2;
        await msg.reply(`🧮 Quanto é **${n1} + ${n2}**? Você tem 10 segundos!`);
        const filter = m_ => m_.author.id === msg.author.id && m_.content === ans.toString();
        msg.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
            .then(() => msg.channel.send("✅ **Certo!** Resposta incrivelmente rápida."))
            .catch(() => msg.channel.send(`❌ O tempo acabou. A resposta era ${ans}.`));
    },

    // 8. Word Scramble (Palavra Embaralhada)
    scramble: async (msg) => {
        const words = ['GATO', 'CACHORRO', 'DISCORD', 'TECLADO', 'MOUSE', 'MONITOR', 'FANTASMA'];
        const word = words[Math.floor(Math.random() * words.length)];
        const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
        await msg.reply(`🧩 Desembaralhe a palavra: **${scrambled}** (Você tem 15s)`);
        const filter = m_ => m_.content.toUpperCase() === word;
        msg.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] })
            .then(c => msg.channel.send(`🎉 <@${c.first().author.id}> acertou! A palavra era **${word}**.`))
            .catch(() => msg.channel.send(`❌ Tempo esgotado! A palavra era **${word}**.`));
    },

    // 9. Minesweeper (Campo Minado Textual)
    minesweeper: (msg) => {
        const size = 5;
        let grid = Array(size).fill().map(()=>Array(size).fill(0));
        let bombs = 4;
        while(bombs > 0) {
            let x = Math.floor(Math.random()*size);
            let y = Math.floor(Math.random()*size);
            if(grid[x][y] !== '💥') { grid[x][y] = '💥'; bombs--; }
        }
        for(let i=0; i<size; i++) {
            for(let j=0; j<size; j++) {
                if(grid[i][j] === '💥') continue;
                let count = 0;
                for(let x=-1; x<=1; x++) {
                    for(let y=-1; y<=1; y++) {
                        if(i+x>=0 && i+x<size && j+y>=0 && j+y<size && grid[i+x][j+y]==='💥') count++;
                    }
                }
                const nums = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
                grid[i][j] = nums[count];
            }
        }
        let txt = grid.map(r => r.map(c => `||${c}||`).join('')).join('\n');
        msg.reply(`💣 **Campo Minado**\n${txt}`);
    },

    // 10. Guess the Number
    guess: async (msg) => {
        const num = Math.floor(Math.random() * 100) + 1;
        await msg.reply("🤔 Pensei em um número de 1 a 100. Tente adivinhar!");
        const filter = m_ => m_.author.id === msg.author.id && !isNaN(m_.content);
        const col = msg.channel.createMessageCollector({ filter, time: 30000 });
        let tries = 0;
        col.on('collect', m_ => {
            tries++;
            const guess = parseInt(m_.content);
            if(guess === num) {
                msg.reply(`🎉 Acertou na mosca em ${tries} tentativas!`);
                col.stop();
            } else if(guess > num) {
                m_.reply("⬇️ Menor...");
            } else {
                m_.reply("⬆️ Maior...");
            }
        });
        col.on('end', c => { if(c.size === 0 || parseInt(c.last().content)!==num) msg.reply(`Acabou o tempo! O número era ${num}.`); });
    },

    // 11. Blackjack (Simplificado)
    blackjack: async (msg) => {
        let pScore = Math.floor(Math.random()*11)+11; // 11 to 21
        let dScore = Math.floor(Math.random()*11)+10;
        const row = new ActionRowBuilder().addComponents(
            createBtn('hit', 'Comprar 🃏', ButtonStyle.Primary),
            createBtn('stand', 'Parar 🛑', ButtonStyle.Danger)
        );
        const m = await msg.reply({ content: `🃏 **Blackjack**\nSua pontuação: **${pScore}**\nBanca (Bot): **${dScore}**`, components: [row] });
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        col.on('collect', async i => {
            if(i.customId === 'hit') {
                pScore += Math.floor(Math.random()*10)+1;
                if(pScore > 21) {
                    await i.update({ content: `💥 Estourou! Sua pontuação: **${pScore}**. Você **perdeu**!`, components: [] });
                    return col.stop();
                } else {
                    await i.update({ content: `🃏 **Blackjack**\nSua pontuação: **${pScore}**\nBanca (Bot): **${dScore}**`, components: [row] });
                }
            } else {
                let endMsg = `🃏 Sua pontuação: **${pScore}** | Banca: **${dScore}**\n`;
                if(dScore > 21 || pScore > dScore) endMsg += "🎉 **VOCÊ VENCEU!**";
                else if(dScore === pScore) endMsg += "🤝 **EMPATE!**";
                else endMsg += "❌ **VOCÊ PERDEU!**";
                await i.update({ content: endMsg, components: [] });
                col.stop();
            }
        });
    },

    // 12. Duelo de Dados (Dice Duel)
    diceduel: async (msg) => {
        const p2 = msg.mentions.users.first();
        if(!p2) return msg.reply("Mencione um adversário!");
        const r1 = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
        const r2 = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
        let txt = `🎲 **Duelo de Dados**\n<@${msg.author.id}> rolou: **${r1}**\n<@${p2.id}> rolou: **${r2}**\n`;
        if(r1>r2) txt += `🏆 <@${msg.author.id}> Venceu!`;
        else if(r2>r1) txt += `🏆 <@${p2.id}> Venceu!`;
        else txt += "🤝 Empate!";
        msg.reply(txt);
    },

    // 13. Verdade ou Desafio (Truth or Dare)
    truthordare: async (msg) => {
        const row = new ActionRowBuilder().addComponents(
            createBtn('truth', 'Verdade 🤔', ButtonStyle.Primary),
            createBtn('dare', 'Desafio 😈', ButtonStyle.Danger)
        );
        const m = await msg.reply({ content: "Escolha: Verdade ou Desafio?", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 20000 }).then(async i => {
            if(i.customId === 'truth') {
                const t = ["Qual seu maior mico?", "Já mentiu pra um amigo hoje?", "Qual sua pior mania?"];
                i.update({ content: `🤔 **Verdade:** ${t[Math.floor(Math.random()*t.length)]}`, components: [] });
            } else {
                const d = ["Mande uma foto engraçada sua", "Mande áudio cantando", "Confesse um segredo no chat geral"];
                i.update({ content: `😈 **Desafio:** ${d[Math.floor(Math.random()*d.length)]}`, components: [] });
            }
        }).catch(()=>{});
    },

    // 14. Bomb Defuse
    bomb: async (msg) => {
        const wires = ['red', 'blue', 'green', 'yellow'];
        const explodeWire = wires[Math.floor(Math.random()*wires.length)];
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('red').setLabel('Fio Vermelho').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('blue').setLabel('Fio Azul').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('green').setLabel('Fio Verde').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('yellow').setLabel('Fio Amarelo').setStyle(ButtonStyle.Secondary)
        );
        const m = await msg.reply({ content: "💣 **DESARME A BOMBA!** Corte um fio!", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 15000 }).then(async i => {
            if(i.customId === explodeWire) i.update({ content: "💥 **KABOOM!** Você cortou o fio errado e a bomba explodiu!", components: [] });
            else i.update({ content: "✅ **Ufa!** A bomba foi desarmada.", components: [] });
        }).catch(() => m.edit({ content: "💥 **KABOOM!** Tempo esgotado!", components: [] }));
    },

    // 15. Typeracer Simplificado
    typeracer: async (msg) => {
        const phrases = ["O rato roeu a roupa do rei", "Um tigre, dois tigres, três tigres", "Discord é o melhor aplicativo"];
        const phrase = phrases[Math.floor(Math.random()*phrases.length)];
        const m = await msg.reply(`⌨️ Digite o mais rápido possível:\n**${phrase}**`);
        const start = Date.now();
        const filter = m_ => m_.content === phrase;
        msg.channel.awaitMessages({ filter, max: 1, time: 20000 }).then(c => {
            const time = ((Date.now() - start)/1000).toFixed(2);
            msg.channel.send(`🏆 <@${c.first().author.id}> digitou corretamente em **${time}s**!`);
        }).catch(() => msg.channel.send("🐌 Ninguém conseguiu digitar a tempo."));
    },

    // 16. O Que Você Prefere? (Would You Rather)
    wyr: async (msg) => {
        const questions = [
            ["Ficar rico mas sem amigos", "Ficar pobre com amigos fiéis"],
            ["Voar", "Ficar invisível"],
            ["Saber a data da sua morte", "Saber a causa da sua morte"]
        ];
        const q = questions[Math.floor(Math.random()*questions.length)];
        const row = new ActionRowBuilder().addComponents(createBtn('1', q[0], ButtonStyle.Primary), createBtn('2', q[1], ButtonStyle.Danger));
        await msg.reply({ content: "🤔 **O que você prefere?**", components: [row] });
        // Simplesmente abre votação.
    },

    // 17. Jogo da Memória (Emoji Memory)
    memory: async (msg) => {
        const emojis = ['🍎','🍎','🍌','🍌','🍇','🍇'];
        const shuffled = emojis.sort(()=>0.5-Math.random());
        const m = await msg.reply(`🧠 Memorize: **${shuffled.join(' ')}**`);
        setTimeout(() => {
            m.edit("🧠 O que estava na 3ª posição?\nResponda com o emoji!");
            const filter = m_ => m_.author.id === msg.author.id && m_.content === shuffled[2];
            msg.channel.awaitMessages({ filter, max: 1, time: 10000 })
                .then(()=>msg.channel.send("✅ Memória de elefante! Acertou."))
                .catch(()=>msg.channel.send(`❌ Errou! O certo era ${shuffled[2]}.`));
        }, 3000);
    },

    // 18. Pescaria (Fishing)
    fish: (msg) => {
        const fishes = ["🐟 Peixe Comum", "🐠 Peixe Tropical", "🐡 Baiacu", "🦈 TUBARÃO!", "👞 Uma bota velha...", "🪙 Um baú do tesouro!"];
        msg.reply(`🎣 Você fisgou: **${fishes[Math.floor(Math.random()*fishes.length)]}**`);
    },

    // 19. Mineração (Mine)
    mine: (msg) => {
        const ores = ["🪨 Pedra", "⛏️ Carvão", "🪙 Ouro", "💎 DIAMANTE!", "🔥 Lava (Você morreu)"];
        msg.reply(`⛏️ Você minerou e achou: **${ores[Math.floor(Math.random()*ores.length)]}**`);
    },

    // 20. Cortar Árvore (Chop)
    chop: (msg) => {
        const loots = ["🪵 2x Madeiras", "🪵 5x Madeiras", "🍎 Uma maçã caiu na sua cabeça", "🐝 Um enxame te atacou!"];
        msg.reply(`🪓 Você cortou a árvore e conseguiu: **${loots[Math.floor(Math.random()*loots.length)]}**`);
    },

    // 21. Assalto (Rob)
    rob: (msg) => {
        const u = msg.mentions.users.first();
        if(!u) return msg.reply("Mencione quem roubar!");
        const success = Math.random() > 0.5;
        if(success) msg.reply(`🥷 Você roubou a carteira de <@${u.id}> e fugiu com sucesso!`);
        else msg.reply(`🚓 Você tentou roubar <@${u.id}>, tropeçou e foi preso!`);
    },

    // 22. Roleta de Cassino (Roulette)
    roulette: (msg) => {
        const colors = ["🔴 Vermelho", "⚫ Preto", "🟢 Verde (Zero)"];
        const num = Math.floor(Math.random()*37);
        let color = num === 0 ? colors[2] : (num % 2 === 0 ? colors[1] : colors[0]);
        msg.reply(`🎰 A roleta girou e caiu em: **${num} ${color}**!`);
    },

    // 23. Corrida de Cavalos (Horse Race)
    horserace: async (msg) => {
        let h1 = 0, h2 = 0, h3 = 0;
        const render = () => `🏇 **Corrida**\n🏁 ${'➖'.repeat(10-h1)}🐎 ${'➖'.repeat(h1)} (1)\n🏁 ${'➖'.repeat(10-h2)}🐎 ${'➖'.repeat(h2)} (2)\n🏁 ${'➖'.repeat(10-h3)}🐎 ${'➖'.repeat(h3)} (3)`;
        const m = await msg.reply(render());
        const inter = setInterval(() => {
            h1 += Math.floor(Math.random()*3);
            h2 += Math.floor(Math.random()*3);
            h3 += Math.floor(Math.random()*3);
            if(h1>=10 || h2>=10 || h3>=10) {
                clearInterval(inter);
                let w = h1>=10 ? 1 : (h2>=10 ? 2 : 3);
                m.edit(render() + `\n🏆 O **Cavalo ${w}** Venceu!`);
            } else {
                m.edit(render());
            }
        }, 1500);
    },

    // 24. Adivinha a Bandeira (Guess Flag)
    guessflag: async (msg) => {
        const flags = { '🇧🇷':'Brasil', '🇺🇸':'Estados Unidos', '🇯🇵':'Japao', '🇫🇷':'Franca', '🇩🇪':'Alemanha' };
        const keys = Object.keys(flags);
        const f = keys[Math.floor(Math.random()*keys.length)];
        await msg.reply(`Qual é este país? ${f}`);
        const filter = m_ => m_.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === flags[f].toLowerCase();
        msg.channel.awaitMessages({ filter, max: 1, time: 15000 })
            .then(c => msg.reply(`🎉 <@${c.first().author.id}> acertou! País: **${flags[f]}**`))
            .catch(() => msg.reply(`❌ O tempo acabou! Era **${flags[f]}**.`));
    },

    // 25. Ligue 4 (Connect 4) Simplificado em Reações
    connect4: async (msg) => {
        msg.reply("🕹️ *Ligue 4 completo exige botões que estouram o limite da API (máx 25). Jogue Jogo da Velha!* `.phantom tictactoe`");
    },

    // 26. Duelo de Cara ou Coroa (Coinflip Duel)
    coinflipduel: async (msg) => {
        const p2 = msg.mentions.users.first();
        if(!p2) return msg.reply("Mencione um adversário!");
        const row = new ActionRowBuilder().addComponents(createBtn('accept', 'Aceitar Duelo', ButtonStyle.Success));
        const m = await msg.reply({ content: `<@${p2.id}>, você foi desafiado por <@${msg.author.id}> para um duelo de moeda!`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===p2.id, time: 20000 }).then(async i => {
            const winner = Math.random() > 0.5 ? msg.author.id : p2.id;
            i.update({ content: `🪙 A moeda girou e... **<@${winner}>** GANHOU O DUELO!`, components: [] });
        }).catch(()=>{});
    },

    // 27. Eu Nunca (Never Have I Ever)
    neverhaveiever: (msg) => {
        const p = ["beijei no primeiro encontro", "dormi na aula", "roubei wi-fi do vizinho", "fingi estar doente"];
        msg.reply(`🖐️ **Eu nunca:** ${p[Math.floor(Math.random()*p.length)]}. (Reajam quem já fez!)`);
    },

    // 28. Maior ou Menor (Higher Lower)
    higherlower: async (msg) => {
        let n1 = Math.floor(Math.random()*10)+1;
        let n2 = Math.floor(Math.random()*10)+1;
        const row = new ActionRowBuilder().addComponents(createBtn('higher', 'Maior ⬆️', ButtonStyle.Success), createBtn('lower', 'Menor ⬇️', ButtonStyle.Danger));
        const m = await msg.reply({ content: `O número atual é **${n1}**.\nO próximo número de 1-10 será Maior ou Menor?`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 15000 }).then(i => {
            if((i.customId==='higher'&&n2>n1) || (i.customId==='lower'&&n2<n1)) i.update({ content: `🎉 Acertou! O próximo número era **${n2}**!`, components: [] });
            else if(n1===n2) i.update({ content: `🤝 Empate! O número continuou **${n2}**. Sorte grande.`, components: [] });
            else i.update({ content: `❌ Errou! O próximo número era **${n2}**!`, components: [] });
        }).catch(()=>{});
    },

    // 29. Quiz Rápido (Trivia)
    trivia: async (msg) => {
        const questions = [
            {q: "Qual planeta é conhecido como Planeta Vermelho?", a: "Marte"},
            {q: "Quantos continentes existem?", a: "7"},
            {q: "Quem pintou a Mona Lisa?", a: "Da Vinci"}
        ];
        const q = questions[Math.floor(Math.random()*questions.length)];
        await msg.reply(`🧠 **Trivia:** ${q.q}`);
        const filter = m_ => m_.content.toLowerCase().includes(q.a.toLowerCase());
        msg.channel.awaitMessages({ filter, max: 1, time: 15000 })
            .then(c => msg.reply(`✅ Acertou, <@${c.first().author.id}>!`))
            .catch(() => msg.reply(`❌ Tempo esgotado! A resposta era: ${q.a}`));
    },

    // 30. Anagrama
    anagram: async (msg) => {
        const words = ['BRASIL', 'COMPUTADOR', 'INTERNET', 'DISCORD'];
        const w = words[Math.floor(Math.random()*words.length)];
        const anag = w.split('').sort(()=>0.5-Math.random()).join('');
        await msg.reply(`🧩 Que palavra é essa? **${anag}**`);
        const filter = m_ => m_.content.toUpperCase() === w;
        msg.channel.awaitMessages({ filter, max: 1, time: 15000 }).then(c=>msg.reply(`✅ Acertou!`)).catch(()=>msg.reply(`❌ Era **${w}**.`));
    },

    // 31 - 40: Extra quick party commands
    fight: (msg) => msg.reply(`🥊 <@${msg.author.id}> deu um soco em <@${msg.mentions.users.first()?.id || "um fantasma"}>! K.O.`),
    heist: (msg) => msg.reply(`💸 A gangue invadiu o banco central. Você lucrou R$ ${Math.floor(Math.random()*10000)}!`),
    hunt: (msg) => msg.reply(`🏹 Você caçou e trouxe: ${["🐇", "🦌", "🦆", "🐗"][Math.floor(Math.random()*4)]}`),
    plant: (msg) => msg.reply(`🌱 Você plantou uma árvore. Cuide bem dela.`),
    water: (msg) => msg.reply(`💦 Você regou sua planta. Ela cresceu um pouquinho.`),
    harvest: (msg) => msg.reply(`🚜 Colheita feita! Você conseguiu 10 🍅 tomates.`),
    work: (msg) => msg.reply(`💼 Você trabalhou duro e ganhou R$ ${Math.floor(Math.random()*500)}. Vai pagar os boletos.`),
    crime: (msg) => msg.reply(Math.random() > 0.5 ? `🦹‍♂️ Você assaltou uma lojinha e ganhou R$ 100.` : `🚓 A polícia te pegou. Pague R$ 500 de fiança.`),
    daily: (msg) => msg.reply(`🎁 Resgatou a recompensa diária de R$ 1000! (Falso, sem DB ainda)`),
    balance: (msg) => msg.reply(`💳 Saldo atual de <@${msg.author.id}>: R$ ∞ (Modo Diversão)`)
};

module.exports = minigames;
