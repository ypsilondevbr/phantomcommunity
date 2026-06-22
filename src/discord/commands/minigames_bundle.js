const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addPoints, removePoints, getTopPlayers, getUserPoints } = require('../../database/db');

function createBtn(id, label, style = ButtonStyle.Primary) {
    return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}

const minigames = {
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

    tictactoe: async (msg) => {
        const p1 = msg.author;
        const p2 = msg.mentions.users.first();
        if(!p2 || p1.id === p2.id) return msg.reply("Mencione outro jogador!");
        
        const acceptRow = new ActionRowBuilder().addComponents(createBtn('accept', 'Aceitar', ButtonStyle.Success));
        const acceptMsg = await msg.reply({ content: `<@${p2.id}>, você foi desafiado para o Jogo da Velha por <@${p1.id}>!`, components: [acceptRow] });
        acceptMsg.awaitMessageComponent({ filter: i=>i.user.id===p2.id, time: 20000 }).then(async i => {
            let board = Array(9).fill('➖');
            let turn = p1.id;
            const winStates = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            
            const buildGrid = () => {
                const rows = [];
                for(let r=0; r<3; r++) {
                    const row = new ActionRowBuilder();
                    for(let c=0; c<3; c++) {
                        const idx = r*3+c;
                        row.addComponents(new ButtonBuilder().setCustomId(`ttt_${idx}`).setLabel(board[idx]).setStyle(board[idx]==='➖' ? ButtonStyle.Secondary : (board[idx]==='❌' ? ButtonStyle.Danger : ButtonStyle.Success)).setDisabled(board[idx]!=='➖'));
                    }
                    rows.push(row);
                }
                return rows;
            };

            await i.update({ content: `**Jogo da Velha**\nVez de: <@${turn}>`, components: buildGrid() });
            const col = acceptMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
            
            col.on('collect', async i2 => {
                if(i2.user.id !== turn) return i2.reply({ content: "Não é sua vez!", ephemeral: true });
                const idx = parseInt(i2.customId.split('_')[1]);
                board[idx] = turn === p1.id ? '❌' : '⭕';
                
                let won = false;
                for(let w of winStates) {
                    if(board[w[0]]!=='➖' && board[w[0]]===board[w[1]] && board[w[1]]===board[w[2]]) won = true;
                }
                
                if(won) {
                    const loser = turn === p1.id ? p2.id : p1.id;
                    addPoints(turn, 10);
                    removePoints(loser, 5);
                    await i2.update({ content: `🎉 **<@${turn}> VENCEU O JOGO DA VELHA! (+10 pts) | <@${loser}> (-5 pts)**`, components: buildGrid() });
                    return col.stop();
                }
                if(!board.includes('➖')) {
                    await i2.update({ content: `🤝 **DEU VELHA! EMPATE!** Ninguém ganha nem perde pontos.`, components: buildGrid() });
                    return col.stop();
                }
                
                turn = turn === p1.id ? p2.id : p1.id;
                await i2.update({ content: `**Jogo da Velha**\nVez de: <@${turn}>`, components: buildGrid() });
            });
        }).catch(() => acceptMsg.edit({ content: "Desafio expirado.", components: [] }));
    },

    gunfight: async (msg) => {
        const p1 = msg.author;
        const p2 = msg.mentions.users.first();
        if(!p2 || p1.id === p2.id) return msg.reply("Mencione um adversário!");
        
        const acceptRow = new ActionRowBuilder().addComponents(createBtn('accept', 'Aceitar Duelo', ButtonStyle.Danger));
        const acceptMsg = await msg.reply({ content: `<@${p2.id}>, <@${p1.id}> te desafiou para um duelo!`, components: [acceptRow] });
        acceptMsg.awaitMessageComponent({ filter: i=>i.user.id===p2.id, time: 20000 }).then(async i => {
            await i.update({ content: `🤠 O duelo entre <@${p1.id}> e <@${p2.id}> vai começar... Preparar...`, components: [] });
            const delay = Math.floor(Math.random() * 5000) + 2000;
            setTimeout(async () => {
                const row = new ActionRowBuilder().addComponents(createBtn('shoot', '🔫 ATIRAR!', ButtonStyle.Danger));
                await acceptMsg.edit({ content: `**ATIRE AGORA!**`, components: [row] });
                acceptMsg.awaitMessageComponent({ filter: btn => btn.user.id === p1.id || btn.user.id === p2.id, componentType: ComponentType.Button, time: 10000 }).then(i2 => {
                    const winner = i2.user.id;
                    const loser = winner === p1.id ? p2.id : p1.id;
                    addPoints(winner, 10);
                    removePoints(loser, 5);
                    i2.update({ content: `💥 **<@${winner}> atirou primeiro e venceu! (+10 pts) | <@${loser}> morreu (-5 pts)**`, components: [] });
                }).catch(() => acceptMsg.edit({ content: `😴 Os dois dormiram no ponto. Empate.`, components: [] }));
            }, delay);
        }).catch(() => acceptMsg.edit({ content: "Duelo recusado/expirado.", components: [] }));
    },

    hangman: async (msg) => {
        const words = ['DISCORD', 'PHANTOM', 'GALAXY', 'COMPUTADOR', 'ASTRONAUTA', 'TECLADO'];
        const word = words[Math.floor(Math.random() * words.length)];
        let guessed = []; let wrong = 0; const maxWrong = 6;
        const render = () => `Forca: ${wrong}/${maxWrong} erros\nPalavra: \`${word.split('').map(c => guessed.includes(c) ? c : '_').join(' ')}\``;
        const m = await msg.channel.send(render() + "\nDigite uma letra no chat!");
        const col = msg.channel.createMessageCollector({ filter: m_ => m_.author.id === msg.author.id && m_.content.length === 1 && m_.content.match(/[a-z]/i), time: 60000 });
        col.on('collect', m_ => {
            const letter = m_.content.toUpperCase();
            if(!guessed.includes(letter)) {
                guessed.push(letter);
                if(!word.includes(letter)) wrong++;
            }
            if(wrong >= maxWrong) {
                removePoints(msg.author.id, 5);
                m.edit(`💀 **VOCÊ FOI ENFORCADO! (-5 pts)** A palavra era: ${word}`); return col.stop();
            }
            if(word.split('').every(c => guessed.includes(c))) {
                addPoints(msg.author.id, 10);
                m.edit(`🎉 **VOCÊ SOBREVIVEU! (+10 pts)** A palavra era: ${word}`); return col.stop();
            }
            m.edit(render() + "\nContinue digitando letras!");
        });
        col.on('end', collected => {
            if(wrong < maxWrong && !word.split('').every(c => guessed.includes(c))) {
                removePoints(msg.author.id, 5);
                m.edit(`⏳ **Tempo esgotado! (-5 pts)** A palavra era: ${word}`);
            }
        });
    },

    russianroulette: async (msg) => {
        const bullet = Math.floor(Math.random() * 6);
        let current = 0;
        const row = new ActionRowBuilder().addComponents(createBtn('pull', '🔫 Puxar Gatilho', ButtonStyle.Danger));
        const m = await msg.reply({ content: `A arma tem 1 bala e 6 espaços. Quem vai puxar o gatilho?`, components: [row] });
        const col = m.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        col.on('collect', async i => {
            if(current === bullet) {
                removePoints(i.user.id, 5);
                await i.update({ content: `💥 **BAM!** <@${i.user.id}> levou um tiro e morreu! (-5 pts)`, components: [] });
                return col.stop();
            } else {
                current++;
                if(current === 5) {
                    addPoints(i.user.id, 10);
                    await i.update({ content: `🎉 **<@${i.user.id}> sobreviveu até o fim e venceu! (+10 pts)**`, components: [] });
                    return col.stop();
                }
                await i.update({ content: `*Click.* <@${i.user.id}> sobreviveu. Próximo! (${current}/6 espaços)`, components: [row] });
            }
        });
    },

    fastclick: async (msg) => {
        const m = await msg.channel.send("Aguarde o botão aparecer...");
        setTimeout(async () => {
            const row = new ActionRowBuilder().addComponents(createBtn('click', 'CLIQUE!', ButtonStyle.Success));
            const start = Date.now();
            await m.edit({ content: "🚨 **AGORA!**", components: [row] });
            m.awaitMessageComponent({ componentType: ComponentType.Button, time: 10000 }).then(i => {
                addPoints(i.user.id, 10);
                i.update({ content: `⚡ <@${i.user.id}> clicou em **${Date.now() - start}ms**! (+10 pts)`, components: [] });
            }).catch(() => { removePoints(msg.author.id, 5); m.edit({ content: "Lentos demais... botão expirou. (-5 pts)", components: [] }); });
        }, Math.floor(Math.random() * 4000) + 2000);
    },

    mathquiz: async (msg) => {
        const n1 = Math.floor(Math.random() * 50); const n2 = Math.floor(Math.random() * 50);
        await msg.reply(`🧮 Quanto é **${n1} + ${n2}**? Você tem 10 segundos!`);
        msg.channel.awaitMessages({ filter: m_ => m_.author.id === msg.author.id && m_.content === (n1+n2).toString(), max: 1, time: 10000, errors: ['time'] })
            .then(c => { addPoints(msg.author.id, 10); msg.channel.send("✅ **Certo! (+10 pts)**"); })
            .catch(() => { removePoints(msg.author.id, 5); msg.channel.send(`❌ O tempo acabou ou errou. A resposta era ${n1+n2}. (-5 pts)`); });
    },

    scramble: async (msg) => {
        const word = ['GATO', 'CACHORRO', 'DISCORD', 'TECLADO', 'MOUSE'][Math.floor(Math.random() * 5)];
        const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
        await msg.reply(`🧩 Desembaralhe a palavra: **${scrambled}** (Você tem 15s)`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toUpperCase() === word, max: 1, time: 15000, errors: ['time'] })
            .then(c => { addPoints(c.first().author.id, 10); msg.channel.send(`🎉 <@${c.first().author.id}> acertou! Era **${word}**. (+10 pts)`); })
            .catch(() => { removePoints(msg.author.id, 5); msg.channel.send(`❌ Tempo esgotado! Era **${word}**. (-5 pts)`); });
    },

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

    guess: async (msg) => {
        const num = Math.floor(Math.random() * 100) + 1;
        await msg.reply("🤔 Pensei em um número de 1 a 100. Tente adivinhar! (30s)");
        const col = msg.channel.createMessageCollector({ filter: m_ => m_.author.id === msg.author.id && !isNaN(m_.content), time: 30000 });
        let tries = 0; let won = false;
        col.on('collect', m_ => {
            tries++; const g = parseInt(m_.content);
            if(g === num) { won = true; addPoints(msg.author.id, 10); msg.reply(`🎉 Acertou na mosca em ${tries} tentativas! (+10 pts)`); col.stop(); }
            else if(g > num) m_.reply("⬇️ Menor..."); else m_.reply("⬆️ Maior...");
        });
        col.on('end', () => {
            if(!won) { removePoints(msg.author.id, 5); msg.channel.send(`⏳ Tempo esgotado! O número era ${num}. (-5 pts)`); }
        });
    },

    diceduel: async (msg) => {
        const p1 = msg.author;
        const p2 = msg.mentions.users.first();
        if(!p2 || p1.id === p2.id) return msg.reply("Mencione um adversário!");
        
        const acceptRow = new ActionRowBuilder().addComponents(createBtn('accept', 'Aceitar Duelo', ButtonStyle.Success));
        const acceptMsg = await msg.reply({ content: `<@${p2.id}>, <@${p1.id}> quer jogar os dados contra você!`, components: [acceptRow] });
        acceptMsg.awaitMessageComponent({ filter: i=>i.user.id===p2.id, time: 20000 }).then(async i => {
            const r1 = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
            const r2 = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
            let txt = `🎲 **Duelo de Dados**\n<@${p1.id}> rolou: **${r1}**\n<@${p2.id}> rolou: **${r2}**\n`;
            if(r1>r2) { addPoints(p1.id, 10); removePoints(p2.id, 5); txt += `🏆 <@${p1.id}> Venceu! (+10 pts) | <@${p2.id}> Perdeu (-5 pts)`; }
            else if(r2>r1) { addPoints(p2.id, 10); removePoints(p1.id, 5); txt += `🏆 <@${p2.id}> Venceu! (+10 pts) | <@${p1.id}> Perdeu (-5 pts)`; }
            else txt += "🤝 Empate!";
            i.update({ content: txt, components: [] });
        }).catch(() => acceptMsg.edit({ content: "Duelo recusado/expirado.", components: [] }));
    },

    truthordare: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('truth', 'Verdade 🤔', ButtonStyle.Primary), createBtn('dare', 'Desafio 😈', ButtonStyle.Danger));
        const m = await msg.reply({ content: "Escolha: Verdade ou Desafio?", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 20000 }).then(async i => {
            if(i.customId === 'truth') i.update({ content: `🤔 **Verdade:** Qual seu maior mico?`, components: [] });
            else i.update({ content: `😈 **Desafio:** Mande uma foto engraçada sua`, components: [] });
        }).catch(()=>{});
    },

    bomb: async (msg) => {
        const wires = ['red', 'blue', 'green', 'yellow'];
        const explodeWire = wires[Math.floor(Math.random()*wires.length)];
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('red').setLabel('Vermelho').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('blue').setLabel('Azul').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('green').setLabel('Verde').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('yellow').setLabel('Amarelo').setStyle(ButtonStyle.Secondary)
        );
        const m = await msg.reply({ content: "💣 **DESARME A BOMBA!** Corte um fio! (15s)", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 15000 }).then(async i => {
            if(i.customId === explodeWire) { removePoints(msg.author.id, 5); i.update({ content: "💥 **KABOOM!** A bomba explodiu! (-5 pts)", components: [] }); }
            else { addPoints(msg.author.id, 10); i.update({ content: "✅ **Ufa!** A bomba foi desarmada. (+10 pts)", components: [] }); }
        }).catch(() => { removePoints(msg.author.id, 5); m.edit({ content: "💥 **KABOOM!** Tempo esgotado! (-5 pts)", components: [] }); });
    },

    typeracer: async (msg) => {
        const phrase = ["O rato roeu a roupa do rei", "Um tigre, dois tigres, três tigres"][Math.floor(Math.random()*2)];
        const start = Date.now();
        await msg.reply(`⌨️ Digite:\n**${phrase}**`);
        msg.channel.awaitMessages({ filter: m_ => m_.content === phrase, max: 1, time: 20000 }).then(c => {
            addPoints(c.first().author.id, 10);
            msg.channel.send(`🏆 <@${c.first().author.id}> digitou corretamente em **${((Date.now()-start)/1000).toFixed(2)}s**! (+10 pts)`);
        }).catch(()=>{ removePoints(msg.author.id, 5); msg.channel.send(`⏳ Tempo esgotado para o Typeracer. (-5 pts)`); });
    },

    wyr: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('1', "Ficar rico sem amigos", ButtonStyle.Primary), createBtn('2', "Ficar pobre com amigos", ButtonStyle.Danger));
        await msg.reply({ content: "🤔 **O que você prefere?**", components: [row] });
    },

    memory: async (msg) => {
        const emojis = ['🍎','🍎','🍌','🍌','🍇','🍇'].sort(()=>0.5-Math.random());
        const m = await msg.reply(`🧠 Memorize: **${emojis.join(' ')}**`);
        setTimeout(() => {
            m.edit("🧠 O que estava na 3ª posição?\nResponda com o emoji!");
            msg.channel.awaitMessages({ filter: m_ => m_.author.id === msg.author.id && m_.content === emojis[2], max: 1, time: 10000 })
                .then(()=>{ addPoints(msg.author.id, 10); msg.channel.send("✅ Memória de elefante! (+10 pts)"); })
                .catch(()=>{ removePoints(msg.author.id, 5); msg.channel.send(`❌ Errou ou tempo esgotado! Era ${emojis[2]}. (-5 pts)`); });
        }, 3000);
    },

    fish: (msg) => { const f = ["🐟", "🐡", "🦈"]; const w = Math.random()>0.7; if(w) addPoints(msg.author.id, 10); msg.reply(`🎣 Você fisgou um ${f[Math.floor(Math.random()*3)]}${w?' (+10 pts)':''}`); },
    mine: (msg) => { const w = Math.random()>0.8; if(w) addPoints(msg.author.id, 10); msg.reply(`⛏️ Achou ${w?'💎 DIAMANTE! (+10 pts)':'🪨 Pedra'}`); },
    chop: (msg) => msg.reply(`🪓 Você cortou madeira.`),
    
    rob: (msg) => {
        const u = msg.mentions.users.first();
        if(!u) return;
        if(Math.random() > 0.5) { addPoints(msg.author.id, 10); msg.reply(`🥷 Roubou <@${u.id}> com sucesso! (+10 pts)`); }
        else { removePoints(msg.author.id, 5); msg.reply(`🚓 Foi preso ao tentar roubar <@${u.id}>! (-5 pts)`); }
    },

    guessflag: async (msg) => {
        await msg.reply(`Qual país é esse? 🇧🇷`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toLowerCase() === 'brasil', max: 1, time: 10000 })
            .then(c => { addPoints(c.first().author.id, 10); msg.reply(`🎉 Acertou! (+10 pts)`); })
            .catch(()=>{ removePoints(msg.author.id, 5); msg.reply(`❌ Tempo esgotado! (-5 pts)`); });
    },

    coinflipduel: async (msg) => {
        const p1 = msg.author;
        const p2 = msg.mentions.users.first();
        if(!p2 || p1.id === p2.id) return msg.reply("Mencione adversário!");
        const row = new ActionRowBuilder().addComponents(createBtn('accept', 'Aceitar', ButtonStyle.Success));
        const m = await msg.reply({ content: `<@${p2.id}> foi desafiado por <@${p1.id}> para cara/coroa!`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===p2.id, time: 20000 }).then(i => {
            const winner = Math.random() > 0.5 ? p1.id : p2.id;
            const loser = winner === p1.id ? p2.id : p1.id;
            addPoints(winner, 10);
            removePoints(loser, 5);
            i.update({ content: `🪙 **<@${winner}>** GANHOU O DUELO! (+10 pts) | <@${loser}> (-5 pts)`, components: [] });
        }).catch(()=> m.edit({ content: "Duelo recusado/expirado.", components: [] }));
    },

    neverhaveiever: (msg) => msg.reply(`🖐️ **Eu nunca:** dormi na aula.`),
    higherlower: async (msg) => {
        let n1 = 5; let n2 = Math.floor(Math.random()*10)+1;
        const row = new ActionRowBuilder().addComponents(createBtn('higher', 'Maior ⬆️', ButtonStyle.Success), createBtn('lower', 'Menor ⬇️', ButtonStyle.Danger));
        const m = await msg.reply({ content: `Atual: **5**. O próximo é Maior ou Menor?`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 15000 }).then(i => {
            if((i.customId==='higher'&&n2>n1) || (i.customId==='lower'&&n2<n1)) { addPoints(msg.author.id, 10); i.update({ content: `🎉 Acertou, era ${n2}! (+10 pts)`, components: [] }); }
            else { removePoints(msg.author.id, 5); i.update({ content: `❌ Errou! Era ${n2}. (-5 pts)`, components: [] }); }
        }).catch(()=> { removePoints(msg.author.id, 5); m.edit({ content: `⏳ Tempo esgotado! (-5 pts)`, components: [] }); });
    },
    trivia: async (msg) => {
        await msg.reply(`🧠 Qual a capital do Brasil?`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toLowerCase() === 'brasilia' || m_.content.toLowerCase() === 'brasília', max: 1, time: 15000 })
            .then(c => { addPoints(c.first().author.id, 10); msg.reply(`✅ Acertou! (+10 pts)`); })
            .catch(()=>{ removePoints(msg.author.id, 5); msg.reply(`❌ Errou ou tempo esgotado! (-5 pts)`); });
    },
    anagram: async (msg) => {
        await msg.reply(`🧩 Anagrama: **OBT** (O que é?)`);
        msg.channel.awaitMessages({ filter: m_ => m_.content.toLowerCase() === 'bot', max: 1, time: 15000 }).then(c=>{ addPoints(c.first().author.id, 10); msg.reply(`✅ Acertou! (+10 pts)`); }).catch(()=>{ removePoints(msg.author.id, 5); msg.reply(`❌ Tempo esgotado. (-5 pts)`); });
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
            else { removePoints(msg.author.id, 5); i.update({ content: `Você jogou ${i.customId}, eu joguei ${bot}. **Eu Venci! (-5 pts)**`, components: [] }); }
        }).catch(()=> { removePoints(msg.author.id, 5); m.edit({ content: `⏳ Tempo esgotado! (-5 pts)`, components: [] }); });
    },
    impostor: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('1', '🧑‍🚀', ButtonStyle.Secondary), createBtn('2', '🧑‍🚀', ButtonStyle.Secondary), createBtn('3', '🧑‍🚀', ButtonStyle.Secondary));
        const m = await msg.reply({ content: "Qual deles é o impostor?", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            const imp = Math.floor(Math.random()*3)+1;
            if(parseInt(i.customId) === imp) { addPoints(msg.author.id, 10); i.update({ content: `🔪 Acertou! O impostor era o ${imp}. (+10 pts)`, components: [] }); }
            else { removePoints(msg.author.id, 5); i.update({ content: `❌ Errou. O impostor era o ${imp} e te matou! (-5 pts)`, components: [] }); }
        }).catch(()=> { removePoints(msg.author.id, 5); m.edit({ content: `⏳ Tempo esgotado! (-5 pts)`, components: [] }); });
    },
    luckybox: async (msg) => {
        const row = new ActionRowBuilder().addComponents(createBtn('box', 'Abrir Caixa 🎁', ButtonStyle.Success));
        const m = await msg.reply({ content: "Tente a sorte!", components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            if(Math.random()>0.7) { addPoints(msg.author.id, 10); i.update({ content: "🎉 Você achou 10 pontos de graça! (+10 pts)", components: [] }); }
            else { removePoints(msg.author.id, 5); i.update({ content: "💨 A caixa estava vazia e tinha uma armadilha. (-5 pts)", components: [] }); }
        }).catch(()=>{});
    },
    fight: (msg) => msg.reply(`🥊 <@${msg.author.id}> deu um soco.`),
    heist: (msg) => msg.reply(`💸 A gangue invadiu o banco.`),
    hunt: (msg) => msg.reply(`🏹 Você caçou.`),
    plant: (msg) => msg.reply(`🌱 Plantação iniciada.`),
    water: (msg) => msg.reply(`💦 Regou as plantas.`)
};

module.exports = minigames;
