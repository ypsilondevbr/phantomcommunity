const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addPoints, getTopPlayers, getUserPoints } = require('../../database/db');

function createBtn(id, label, style = ButtonStyle.Primary) {
    return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}

const minigames = {
    // 0. RANKING (Leaderboard)
    rank: async (msg) => {
        const top = getTopPlayers(10);
        if(!top || top.length === 0) return msg.reply("Ninguém ganhou pontos ainda!");
        let desc = "";
        const medals = ['🥇', '🥈', '🥉'];
        for(let i=0; i<top.length; i++) {
            const medal = i < 3 ? medals[i] : `**#${i+1}**`;
            desc += `${medal} <@${top[i].user_id}> — **${top[i].points}** pts\n`;
        }
        msg.reply({ embeds: [new EmbedBuilder().setTitle("🏆 Ranking de Jogadores (Minigames)").setDescription(desc).setColor('#FFD700')] });
    },

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
                addPoints(turn, 10);
                await i.update({ content: `🎉 **<@${turn}> VENCEU O JOGO DA VELHA! (+10 pts)**`, components: buildGrid() });
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
            m.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 10000 }).then(i => {
                addPoints(i.user.id, 10);
                i.update({ content: `💥 **<@${i.user.id}> atirou primeiro e venceu o duelo! (+10 pts)**`, components: [] });
            }).catch(() => m.edit({ content: `😴 Os dois dormiram no ponto. Empate.`, components: [] }));
        }, delay);
    },

    // 3. Forca (Hangman)
    hangman: async (msg) => {
        const words = ['DISCORD', 'PHANTOM', 'GALAXY', 'COMPUTADOR', 'ASTRONAUTA', 'TECLADO'];
        const word = words[Math.floor(Math.random() * words.length)];
        let guessed = []; let wrong = 0; const maxWrong = 6;
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
                m.edit(`💀 **VOCÊ FOI ENFORCADO!** A palavra era: ${word}`); return col.stop();
            }
            if(word.split('').every(c => guessed.includes(c))) {
                addPoints(msg.author.id, 10);
                m.edit(`🎉 **VOCÊ SOBREVIVEU! (+10 pts)** A palavra era: ${word}`); return col.stop();
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
                if(current === 5) { // Só sobrou a bala
                    addPoints(i.user.id, 10);
                    await i.update({ content: `🎉 **<@${i.user.id}> sobreviveu até o fim e venceu! (+10 pts)**`, components: [] });
                    return col.stop();
                }
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
            if(win) addPoints(msg.author.id, 10);
            m.edit(`🎰 **SLOTS** 🎰\n[ ${res.join(' | ')} ]\n${win ? "🎉 **JACKPOT! Você ganhou! (+10 pts)**" : "❌ **Você perdeu!**"}`);
        }, 1500);
    },

    // 6. Fast Click
    fastclick: async (msg) => {
        const m = await msg.channel.send("Aguarde o botão aparecer...");
        setTimeout(async () => {
            const row = new ActionRowBuilder().addComponents(createBtn('click', 'CLIQUE!', ButtonStyle.Success));
            const start = Date.now();
            await m.edit({ content: "🚨 **AGORA!**", components: [row] });
            m.awaitMessageComponent({ componentType: ComponentType.Button, time: 10000 }).then(i => {
                addPoints(i.user.id, 10);
                i.update({ content: `⚡ <@${i.user.id}> clicou em **${Date.now() - start}ms**! (+10 pts)`, components: [] });
            }).catch(() => m.edit({ content: "Lentos demais... botão expirou.", components: [] }));
        }, Math.floor(Math.random() * 4000) + 2000);
    },

    // 7. Math Quiz
    mathquiz: async (msg) => {
        const n1 = Math.floor(Math.random() * 50); const n2 = Math.floor(Math.random() * 50);
        await msg.reply(`🧮 Quanto é **${n1} + ${n2}**? Você tem 10 segundos!`);
        msg.channel.awaitMessages({ filter: m_ => m_.author.id === msg.author.id && m_.content === (n1+n2).toString(), max: 1, time: 10000, errors: ['time'] })
            .then(c => { addPoints(msg.author.id, 10); msg.channel.send("✅ **Certo! (+10 pts)**"); })
            .catch(() => msg.channel.send(`❌ O tempo acabou. A resposta era ${n1+n2}.`));
    },

    // 8. Word Scramble
    scramble: async (msg) => {
        const word = ['GATO', 'CACHORRO', 'DISCORD', 'TECLADO', 'MOUSE'][Math.floor(Math.random() * 5)];
        const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
        await msg.reply(`🧩 Desembaralhe a palavra: **${scrambled}** (Você tem 15s)`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toUpperCase() === word, max: 1, time: 15000, errors: ['time'] })
            .then(c => { addPoints(c.first().author.id, 10); msg.channel.send(`🎉 <@${c.first().author.id}> acertou! Era **${word}**. (+10 pts)`); })
            .catch(() => msg.channel.send(`❌ Tempo esgotado! Era **${word}**.`));
    },

    // 9. Minesweeper
    minesweeper: (msg) => {
        let grid = Array(5).fill().map(()=>Array(5).fill(0));
        let bombs = 4;
        while(bombs > 0) {
            let x = Math.floor(Math.random()*5); let y = Math.floor(Math.random()*5);
            if(grid[x][y] !== '💥') { grid[x][y] = '💥'; bombs--; }
        }
        for(let i=0; i<5; i++) for(let j=0; j<5; j++) {
            if(grid[i][j] === '💥') continue;
            let count = 0;
            for(let x=-1; x<=1; x++) for(let y=-1; y<=1; y++) if(i+x>=0 && i+x<5 && j+y>=0 && j+y<5 && grid[i+x][j+y]==='💥') count++;
            grid[i][j] = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'][count];
        }
        msg.reply(`💣 **Campo Minado**\n${grid.map(r => r.map(c => `||${c}||`).join('')).join('\n')}`);
    },

    // 10. Guess
    guess: async (msg) => {
        const num = Math.floor(Math.random() * 100) + 1;
        await msg.reply("🤔 Pensei em um número de 1 a 100. Tente adivinhar! (30s)");
        const col = msg.channel.createMessageCollector({ filter: m_ => m_.author.id === msg.author.id && !isNaN(m_.content), time: 30000 });
        let tries = 0;
        col.on('collect', m_ => {
            tries++; const g = parseInt(m_.content);
            if(g === num) { addPoints(msg.author.id, 10); msg.reply(`🎉 Acertou na mosca em ${tries} tentativas! (+10 pts)`); col.stop(); }
            else if(g > num) m_.reply("⬇️ Menor..."); else m_.reply("⬆️ Maior...");
        });
    },

    // 11. Blackjack FIXO
    blackjack: async (msg) => {
        let deck = [2,3,4,5,6,7,8,9,10,10,10,10,11];
        const getCard = () => deck[Math.floor(Math.random()*deck.length)];
        let pScore = getCard() + getCard();
        let dScore = getCard();
        let hiddenDScore = dScore + getCard(); // Dealer total hidden
        
        const row = new ActionRowBuilder().addComponents(createBtn('hit', 'Comprar 🃏', ButtonStyle.Primary), createBtn('stand', 'Parar 🛑', ButtonStyle.Danger));
        const m = await msg.reply({ content: `🃏 **Blackjack**\nSua pontuação: **${pScore}**\nBanca mostra: **${dScore}**`, components: [row] });
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        
        col.on('collect', async i => {
            if(i.customId === 'hit') {
                pScore += getCard();
                if(pScore > 21) {
                    await i.update({ content: `💥 Estourou! Sua pontuação: **${pScore}**. Você **perdeu**!`, components: [] });
                    return col.stop();
                } else {
                    await i.update({ content: `🃏 **Blackjack**\nSua pontuação: **${pScore}**\nBanca mostra: **${dScore}**`, components: [row] });
                }
            } else {
                // Stand - Dealer plays
                while(hiddenDScore < 17) hiddenDScore += getCard();
                let endMsg = `🃏 Sua pontuação: **${pScore}** | Banca final: **${hiddenDScore}**\n`;
                if(hiddenDScore > 21 || pScore > hiddenDScore) {
                    addPoints(msg.author.id, 10);
                    endMsg += "🎉 **VOCÊ VENCEU A BANCA! (+10 pts)**";
                } else if(hiddenDScore === pScore) endMsg += "🤝 **EMPATE!** Ninguém ganha nada.";
                else endMsg += "❌ **VOCÊ PERDEU PARA A BANCA!**";
                await i.update({ content: endMsg, components: [] });
                col.stop();
            }
        });
    },

    // 12. Duelo de Dados
    diceduel: async (msg) => {
        const p2 = msg.mentions.users.first();
        if(!p2) return msg.reply("Mencione um adversário!");
        const r1 = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
        const r2 = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
        let txt = `🎲 **Duelo de Dados**\n<@${msg.author.id}> rolou: **${r1}**\n<@${p2.id}> rolou: **${r2}**\n`;
        if(r1>r2) { addPoints(msg.author.id, 10); txt += `🏆 <@${msg.author.id}> Venceu! (+10 pts)`; }
        else if(r2>r1) { addPoints(p2.id, 10); txt += `🏆 <@${p2.id}> Venceu! (+10 pts)`; }
        else txt += "🤝 Empate!";
        msg.reply(txt);
    },

    // 13. Verdade ou Desafio
    truthordare: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('truth', 'Verdade 🤔', ButtonStyle.Primary), createBtn('dare', 'Desafio 😈', ButtonStyle.Danger));
        const m = await msg.reply({ content: "Escolha: Verdade ou Desafio?", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 20000 }).then(async i => {
            if(i.customId === 'truth') i.update({ content: `🤔 **Verdade:** Qual seu maior mico?`, components: [] });
            else i.update({ content: `😈 **Desafio:** Mande uma foto engraçada sua`, components: [] });
        }).catch(()=>{});
    },

    // 14. Bomb Defuse
    bomb: async (msg) => {
        const wires = ['red', 'blue', 'green', 'yellow'];
        const explodeWire = wires[Math.floor(Math.random()*wires.length)];
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('red').setLabel('Vermelho').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('blue').setLabel('Azul').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('green').setLabel('Verde').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('yellow').setLabel('Amarelo').setStyle(ButtonStyle.Secondary)
        );
        const m = await msg.reply({ content: "💣 **DESARME A BOMBA!** Corte um fio!", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 15000 }).then(async i => {
            if(i.customId === explodeWire) i.update({ content: "💥 **KABOOM!** A bomba explodiu!", components: [] });
            else { addPoints(msg.author.id, 10); i.update({ content: "✅ **Ufa!** A bomba foi desarmada. (+10 pts)", components: [] }); }
        }).catch(() => m.edit({ content: "💥 **KABOOM!** Tempo esgotado!", components: [] }));
    },

    // 15. Typeracer
    typeracer: async (msg) => {
        const phrase = ["O rato roeu a roupa do rei", "Um tigre, dois tigres, três tigres"][Math.floor(Math.random()*2)];
        const start = Date.now();
        await msg.reply(`⌨️ Digite:\n**${phrase}**`);
        msg.channel.awaitMessages({ filter: m_ => m_.content === phrase, max: 1, time: 20000 }).then(c => {
            addPoints(c.first().author.id, 10);
            msg.channel.send(`🏆 <@${c.first().author.id}> digitou corretamente em **${((Date.now()-start)/1000).toFixed(2)}s**! (+10 pts)`);
        }).catch(()=>{});
    },

    // 16. O Que Você Prefere?
    wyr: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('1', "Ficar rico sem amigos", ButtonStyle.Primary), createBtn('2', "Ficar pobre com amigos", ButtonStyle.Danger));
        await msg.reply({ content: "🤔 **O que você prefere?**", components: [row] });
    },

    // 17. Memory
    memory: async (msg) => {
        const emojis = ['🍎','🍎','🍌','🍌','🍇','🍇'].sort(()=>0.5-Math.random());
        const m = await msg.reply(`🧠 Memorize: **${emojis.join(' ')}**`);
        setTimeout(() => {
            m.edit("🧠 O que estava na 3ª posição?\nResponda com o emoji!");
            msg.channel.awaitMessages({ filter: m_ => m_.author.id === msg.author.id && m_.content === emojis[2], max: 1, time: 10000 })
                .then(()=>{ addPoints(msg.author.id, 10); msg.channel.send("✅ Memória de elefante! (+10 pts)"); })
                .catch(()=>msg.channel.send(`❌ Errou! Era ${emojis[2]}.`));
        }, 3000);
    },

    // 18-20: Pescaria, Mine, Chop
    fish: (msg) => { const f = ["🐟", "🐡", "🦈"]; const w = Math.random()>0.7; if(w) addPoints(msg.author.id, 10); msg.reply(`🎣 Você fisgou um ${f[Math.floor(Math.random()*3)]}${w?' (+10 pts)':''}`); },
    mine: (msg) => { const w = Math.random()>0.8; if(w) addPoints(msg.author.id, 10); msg.reply(`⛏️ Achou ${w?'💎 DIAMANTE! (+10 pts)':'🪨 Pedra'}`); },
    chop: (msg) => msg.reply(`🪓 Você cortou madeira.`),
    
    // 21. Rob
    rob: (msg) => {
        const u = msg.mentions.users.first();
        if(!u) return;
        if(Math.random() > 0.5) { addPoints(msg.author.id, 10); msg.reply(`🥷 Roubou <@${u.id}> com sucesso! (+10 pts)`); }
        else msg.reply(`🚓 Foi preso ao tentar roubar <@${u.id}>!`);
    },

    // 22. Roulette
    roulette: (msg) => {
        const num = Math.floor(Math.random()*37);
        if(num === 7) addPoints(msg.author.id, 10);
        msg.reply(`🎰 Caiu no **${num}**. ${num===7?'Você acertou o jackpot! (+10 pts)':''}`);
    },

    // 23. Horse Race
    horserace: async (msg) => {
        let h1 = 0, h2 = 0;
        const render = () => `🏇 **Corrida**\n🏁 ${'➖'.repeat(10-h1)}🐎 ${'➖'.repeat(h1)} (1)\n🏁 ${'➖'.repeat(10-h2)}🐎 ${'➖'.repeat(h2)} (2)`;
        const m = await msg.reply(render());
        const inter = setInterval(() => {
            h1 += Math.floor(Math.random()*3); h2 += Math.floor(Math.random()*3);
            if(h1>=10 || h2>=10) { clearInterval(inter); m.edit(render() + `\n🏆 **Cavalo ${h1>=10?1:2}** Venceu!`); }
            else m.edit(render());
        }, 1500);
    },

    // 24. Guess Flag
    guessflag: async (msg) => {
        await msg.reply(`Qual país é esse? 🇧🇷`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toLowerCase() === 'brasil', max: 1, time: 10000 })
            .then(c => { addPoints(c.first().author.id, 10); msg.reply(`🎉 Acertou! (+10 pts)`); }).catch(()=>{});
    },

    // 25. Coinflip duel
    coinflipduel: async (msg) => {
        const p2 = msg.mentions.users.first();
        if(!p2) return msg.reply("Mencione adversário!");
        const row = new ActionRowBuilder().addComponents(createBtn('accept', 'Aceitar', ButtonStyle.Success));
        const m = await msg.reply({ content: `<@${p2.id}> foi desafiado por <@${msg.author.id}> para cara/coroa!`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===p2.id, time: 20000 }).then(i => {
            const winner = Math.random() > 0.5 ? msg.author.id : p2.id;
            addPoints(winner, 10);
            i.update({ content: `🪙 **<@${winner}>** GANHOU O DUELO! (+10 pts)`, components: [] });
        }).catch(()=>{});
    },

    // 26-30: Never Have I Ever, Higher Lower, Trivia, Anagram, Snail Race
    neverhaveiever: (msg) => msg.reply(`🖐️ **Eu nunca:** dormi na aula.`),
    higherlower: async (msg) => {
        let n1 = 5; let n2 = Math.floor(Math.random()*10)+1;
        const row = new ActionRowBuilder().addComponents(createBtn('higher', 'Maior ⬆️', ButtonStyle.Success), createBtn('lower', 'Menor ⬇️', ButtonStyle.Danger));
        const m = await msg.reply({ content: `Atual: **5**. O próximo é Maior ou Menor?`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 15000 }).then(i => {
            if((i.customId==='higher'&&n2>n1) || (i.customId==='lower'&&n2<n1)) { addPoints(msg.author.id, 10); i.update({ content: `🎉 Acertou, era ${n2}! (+10 pts)`, components: [] }); }
            else i.update({ content: `❌ Errou! Era ${n2}.`, components: [] });
        }).catch(()=>{});
    },
    trivia: async (msg) => {
        await msg.reply(`🧠 Qual a capital do Brasil?`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toLowerCase() === 'brasilia' || m_.content.toLowerCase() === 'brasília', max: 1, time: 15000 })
            .then(c => { addPoints(c.first().author.id, 10); msg.reply(`✅ Acertou! (+10 pts)`); }).catch(()=>{});
    },
    anagram: async (msg) => {
        await msg.reply(`🧩 Anagrama: **OBT** (O que é?)`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toLowerCase() === 'bot', max: 1, time: 15000 }).then(c=>{ addPoints(c.first().author.id, 10); msg.reply(`✅ Acertou! (+10 pts)`); }).catch(()=>{});
    },
    snailrace: async (msg) => {
        let s1 = 0, s2 = 0;
        const render = () => `🐌 **Corrida**\n🏁 ${'➖'.repeat(10-s1)}🐌 ${'➖'.repeat(s1)} (A)\n🏁 ${'➖'.repeat(10-s2)}🐌 ${'➖'.repeat(s2)} (B)`;
        const m = await msg.reply(render());
        const inter = setInterval(() => {
            s1 += Math.floor(Math.random()*2); s2 += Math.floor(Math.random()*2);
            if(s1>=5 || s2>=5) { clearInterval(inter); m.edit(render() + `\n🏆 **Caracol ${s1>=5?'A':'B'}** Venceu!`); }
            else m.edit(render());
        }, 2000);
    },

    // NOVOS JOGOS (31 a 40)
    // 31. Baccarat
    baccarat: (msg) => {
        let pb = Math.floor(Math.random()*9); let bb = Math.floor(Math.random()*9);
        if(pb > bb) { addPoints(msg.author.id, 10); msg.reply(`🃏 **Baccarat**: Você tirou ${pb}, a Banca tirou ${bb}. **Você ganhou! (+10 pts)**`); }
        else msg.reply(`🃏 **Baccarat**: Você tirou ${pb}, a Banca tirou ${bb}. Você perdeu.`);
    },
    // 32. Colorbet
    colorbet: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('red', 'Vermelho', ButtonStyle.Danger), createBtn('blue', 'Azul', ButtonStyle.Primary));
        const m = await msg.reply({ content: "Escolha uma cor!", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            const w = Math.random()>0.5 ? 'red' : 'blue';
            if(i.customId === w) { addPoints(msg.author.id, 10); i.update({ content: `🎨 Deu ${w==='red'?'Vermelho':'Azul'}! Você acertou! (+10 pts)`, components: [] }); }
            else i.update({ content: `🎨 Deu ${w==='red'?'Vermelho':'Azul'}! Você errou.`, components: [] });
        }).catch(()=>{});
    },
    // 33. Roshambo (Pedra Papel Tesoura em Botões)
    roshambo: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('rock', 'Pedra 🪨', ButtonStyle.Secondary), createBtn('paper', 'Papel 📄', ButtonStyle.Secondary), createBtn('scissors', 'Tesoura ✂️', ButtonStyle.Secondary));
        const m = await msg.reply({ content: "Pedra, Papel ou Tesoura?", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            const bot = ['rock', 'paper', 'scissors'][Math.floor(Math.random()*3)];
            let win = false; let tie = false;
            if(i.customId === bot) tie = true;
            else if((i.customId==='rock'&&bot==='scissors') || (i.customId==='paper'&&bot==='rock') || (i.customId==='scissors'&&bot==='paper')) win = true;
            if(win) { addPoints(msg.author.id, 10); i.update({ content: `Você jogou ${i.customId}, eu joguei ${bot}. **Você Venceu! (+10 pts)**`, components: [] }); }
            else if(tie) i.update({ content: `Empate! Ambos jogaram ${bot}.`, components: [] });
            else i.update({ content: `Você jogou ${i.customId}, eu joguei ${bot}. **Eu Venci!**`, components: [] });
        }).catch(()=>{});
    },
    // 34. Find the Impostor
    impostor: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('1', '🧑‍🚀', ButtonStyle.Secondary), createBtn('2', '🧑‍🚀', ButtonStyle.Secondary), createBtn('3', '🧑‍🚀', ButtonStyle.Secondary));
        const m = await msg.reply({ content: "Qual deles é o impostor?", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            const imp = Math.floor(Math.random()*3)+1;
            if(parseInt(i.customId) === imp) { addPoints(msg.author.id, 10); i.update({ content: `🔪 Acertou! O impostor era o ${imp}. (+10 pts)`, components: [] }); }
            else i.update({ content: `❌ Errou. O impostor era o ${imp} e te matou!`, components: [] });
        }).catch(()=>{});
    },
    // 35. Lucky Box
    luckybox: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('box', 'Abrir Caixa 🎁', ButtonStyle.Success));
        const m = await msg.reply({ content: "Tente a sorte!", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            if(Math.random()>0.7) { addPoints(msg.author.id, 10); i.update({ content: "🎉 Você achou 10 pontos de graça! (+10 pts)", components: [] }); }
            else i.update({ content: "💨 A caixa estava vazia.", components: [] });
        }).catch(()=>{});
    },
    // 36-40: Quick fun commands
    fight: (msg) => msg.reply(`🥊 <@${msg.author.id}> deu um soco.`),
    heist: (msg) => msg.reply(`💸 A gangue invadiu o banco.`),
    hunt: (msg) => msg.reply(`🏹 Você caçou.`),
    plant: (msg) => msg.reply(`🌱 Plantação iniciada.`),
    water: (msg) => msg.reply(`💦 Regou as plantas.`)
};

module.exports = minigames;
