const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addPoints, removePoints, getUserPoints } = require('../../database/db');

const wait = ms => new Promise(res => setTimeout(res, ms));

const ansi = {
    red: "\x1b[1;31m", green: "\x1b[1;32m", yellow: "\x1b[1;33m",
    blue: "\x1b[1;34m", cyan: "\x1b[1;36m", white: "\x1b[1;37m",
    reset: "\x1b[0m", bgRed: "\x1b[41m", bgGreen: "\x1b[42m"
};

function checkBet(msg, args) {
    if(!args || args.length === 0) {
        msg.reply("💰 **Uso incorreto!** Informe a aposta. Ex: `.phantom <jogo> 50`");
        return null;
    }
    let amount = parseInt(args[0]);
    if(args[0].toLowerCase() === 'all') amount = getUserPoints(msg.author.id);
    if(isNaN(amount) || amount <= 0) {
        msg.reply("💰 O valor deve ser maior que 0.");
        return null;
    }
    const balance = getUserPoints(msg.author.id);
    if(amount > balance) {
        msg.reply(`💸 **Saldo Insuficiente!** Você tem apenas **${balance}** pontos.`);
        return null;
    }
    return amount;
}

function createBtn(id, label, style = ButtonStyle.Primary) {
    return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}

const casino = {
    // 1. Aviator
    aviator: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        let mult = 1.00;
        let crashed = false;
        const crashPoint = Math.random() < 0.05 ? 1.00 : parseFloat((1.01 + Math.random()*5 + (Math.random()>0.8?Math.random()*15:0)).toFixed(2));
        
        const row = new ActionRowBuilder().addComponents(createBtn('cashout', `💰 CASHOUT (0 pts)`, ButtonStyle.Success));
        
        const renderSky = (m, c, status) => {
            let skyColor = ansi.cyan;
            let embedColor = '#00BFFF';
            if(m > 2.0) { skyColor = ansi.green; embedColor = '#00FF00'; }
            if(m > 5.0) { skyColor = ansi.yellow; embedColor = '#FFFF00'; }
            if(m > 10.0) { skyColor = ansi.red; embedColor = '#FF0000'; }
            if(c) { skyColor = ansi.bgRed + ansi.white; embedColor = '#8B0000'; }
            
            const planePos = Math.min(25, Math.floor(m * 2));
            const pad = planePos > 2 ? planePos - 2 : 0;
            const clouds = " ".repeat(pad) + (c ? "💥" : "✈️");
            const track = "🛫" + "=".repeat(planePos) + "🚀";
            
            const txt = `\`\`\`ansi\n${skyColor}Altitude Atual: ${m.toFixed(2)}x${ansi.reset}\n\n${clouds}\n${track}\n\`\`\``;
            
            return new EmbedBuilder()
                .setTitle("✈️ Phantom Aviator")
                .setDescription(txt + `\n**Aposta:** ${bet} pts\n**Status:** ${status}`)
                .setColor(embedColor);
        };

        const m = await msg.reply({ embeds: [renderSky(mult, false, "Decolando...")], components: [row] });
        
        let active = true;
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 60000 });
        
        col.on('collect', async i => {
            if(!active) return;
            active = false;
            const win = Math.floor(bet * mult);
            addPoints(msg.author.id, win);
            await i.update({ embeds: [renderSky(mult, false, `✅ CASHOUT! Lucro: +${win} pts`)], components: [] });
            col.stop();
        });
        
        while(active) {
            await wait(1500); 
            if(!active) break;
            mult += 0.15 + (mult * 0.05);
            if(mult >= crashPoint) {
                active = false;
                await m.edit({ embeds: [renderSky(crashPoint, true, `❌ CRASHED! Perdeu ${bet} pts`)], components: [] }).catch(()=>{});
                col.stop();
                break;
            } else {
                row.components[0].setLabel(`💰 CASHOUT (${Math.floor(bet * mult)} pts)`);
                await m.edit({ embeds: [renderSky(mult, false, "Subindo...")], components: [row] }).catch(()=>{});
            }
        }
    }
};


    // 2. High-Fidelity Crash
    
    // 2. High-Fidelity Crash
    crash: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        let mult = 1.00;
        const crashPoint = Math.random() < 0.05 ? 1.00 : parseFloat((1.01 + Math.random()*4 + (Math.random()>0.8?Math.random()*10:0)).toFixed(2));
        
        const row = new ActionRowBuilder().addComponents(createBtn('cashout', `💰 CASHOUT (0 pts)`, ButtonStyle.Success));
        
        const renderGraph = (m, c) => {
            let color = ansi.green;
            let embedColor = '#00FF00';
            if(m > 2) { color = ansi.yellow; embedColor = '#FFFF00'; }
            if(m > 5) { color = ansi.cyan; embedColor = '#00FFFF'; }
            if(c) { color = ansi.red; embedColor = '#FF0000'; }
            
            const bars = Math.min(10, Math.floor(m));
            let graph = "";
            for(let i=10; i>=1; i--) {
                if(i <= bars) {
                    graph += `${i.toString().padStart(2, ' ')}x | ` + "🟩".repeat(i) + (i === bars ? (c ? "💥" : "🚀") : "") + "\n";
                } else {
                    graph += `${i.toString().padStart(2, ' ')}x |\n`;
                }
            }
            graph += "    +--------------------------------\n";
            
            const txt = `\`\`\`ansi\n${color}Multiplicador: ${m.toFixed(2)}x${ansi.reset}\n\n${graph}\`\`\``;
            
            return new EmbedBuilder()
                .setTitle("📈 Phantom Crash")
                .setDescription(txt + `\n**Aposta:** ${bet} pts`)
                .setColor(embedColor);
        };

        const m = await msg.reply({ embeds: [renderGraph(mult, false)], components: [row] });
        
        let active = true;
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 60000 });
        
        col.on('collect', async i => {
            if(!active) return;
            active = false;
            const win = Math.floor(bet * mult);
            addPoints(msg.author.id, win);
            await i.update({ embeds: [renderGraph(mult, false).setFooter({text: `✅ Você saiu em ${mult.toFixed(2)}x e ganhou ${win} pts!`})], components: [] });
            col.stop();
        });
        
        while(active) {
            await wait(1500);
            if(!active) break;
            mult += 0.20 + (mult * 0.1);
            if(mult >= crashPoint) {
                active = false;
                await m.edit({ embeds: [renderGraph(crashPoint, true).setFooter({text: `❌ CRASHED! O foguete estourou em ${crashPoint.toFixed(2)}x`})], components: [] }).catch(()=>{});
                col.stop();
                break;
            } else {
                row.components[0].setLabel(`💰 CASHOUT (${Math.floor(bet * mult)} pts)`);
                await m.edit({ embeds: [renderGraph(mult, false)], components: [row] }).catch(()=>{});
            }
        }
    },

    // 3. High-Fidelity Roleta
    roleta: async (msg, args) => {
        if(!args || args.length < 2) return msg.reply("💰 **Uso:** `.phantom roleta <aposta> <cor/numero>` (Cores: red, black, green)");
        const bet = checkBet(msg, [args[0]]); if(!bet) return;
        const pick = args[1].toLowerCase();
        
        removePoints(msg.author.id, bet);
        
        const rOrder = [
            {n:0,c:'green'},{n:32,c:'red'},{n:15,c:'black'},{n:19,c:'red'},{n:4,c:'black'},
            {n:21,c:'red'},{n:2,c:'black'},{n:25,c:'red'},{n:17,c:'black'},{n:34,c:'red'},
            {n:6,c:'black'},{n:27,c:'red'},{n:13,c:'black'},{n:36,c:'red'},{n:11,c:'black'},
            {n:30,c:'red'},{n:8,c:'black'},{n:23,c:'red'},{n:10,c:'black'},{n:5,c:'red'},
            {n:24,c:'black'},{n:16,c:'red'},{n:33,c:'black'},{n:1,c:'red'},{n:20,c:'black'},
            {n:14,c:'red'},{n:31,c:'black'},{n:9,c:'red'},{n:22,c:'black'},{n:18,c:'red'},
            {n:29,c:'black'},{n:7,c:'red'},{n:28,c:'black'},{n:12,c:'red'},{n:35,c:'black'},{n:3,c:'red'},{n:26,c:'black'}
        ];
        
        // Random winning index
        const winIdx = Math.floor(Math.random() * rOrder.length);
        
        const renderWheel = (offset, isFinal) => {
            let line = "";
            for(let i=0; i<5; i++) {
                let p = (offset + i) % rOrder.length;
                let col = rOrder[p].c === 'red' ? ansi.bgRed+ansi.white : (rOrder[p].c==='black' ? ansi.white : ansi.bgGreen+ansi.white);
                line += `${col}[${rOrder[p].n.toString().padStart(2,'0')}]${ansi.reset} `;
            }
            
            const pointer = " ".repeat(12) + "⬆️";
            const loading = isFinal ? "[██████████] Parado." : `[${"█".repeat(Math.floor(offset%10))}${"░".repeat(10 - Math.floor(offset%10))}] Girando...`;
            
            const txt = \`\\\`\\\`\\\`ansi\\n\${line}\\n\${pointer}\\n\\n\${loading}\\\`\\\`\\\`\`;
            
            return new EmbedBuilder()
                .setTitle("🎰 Phantom Roleta")
                .setDescription(txt + \`\\n**Aposta:** \${bet} pts | **Palpite:** \${pick.toUpperCase()}\`)
                .setColor(isFinal ? '#FFFF00' : '#8A2BE2');
        };

        const m = await msg.reply({ embeds: [renderWheel(winIdx - 10, false)] });
        
        let frames = 8;
        let currOffset = winIdx - frames;
        if (currOffset < 0) currOffset += rOrder.length;
        
        while(frames > 2) {
            await wait(1200);
            currOffset = (currOffset + 1) % rOrder.length;
            await m.edit({ embeds: [renderWheel(currOffset, false)] }).catch(()=>{});
            frames--;
        }
        
        await wait(1500);
        // Centralize winIdx exactly in the middle of 5 (so index 2)
        const finalOffset = (winIdx - 2 + rOrder.length) % rOrder.length;
        const res = rOrder[winIdx];
        
        let won = false;
        let winAmt = 0;
        
        if(pick === res.c) {
            won = true; winAmt = bet * (res.c === 'green' ? 14 : 2);
        } else if (parseInt(pick) === res.n) {
            won = true; winAmt = bet * 35;
        }
        
        if(won) {
            addPoints(msg.author.id, winAmt);
            await m.edit({ embeds: [renderWheel(finalOffset, true).setFooter({text: `🎉 PARABÉNS! Caiu no ${res.n} ${res.c.toUpperCase()} e você ganhou ${winAmt} pts!`}).setColor('#00FF00')] });
        } else {
            await m.edit({ embeds: [renderWheel(finalOffset, true).setFooter({text: `❌ Caiu no ${res.n} ${res.c.toUpperCase()}! Você perdeu ${bet} pts.`}).setColor('#FF0000')] });
        }
    },

    // 4. High-Fidelity HorseRace
    horserace: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        
        const hList = [
            { id: 1, name: "Trovão Azul", desc: "O Favorito", speed: 80, odd: 1.8, emoji: "🟦" },
            { id: 2, name: "Bala de Prata", desc: "O Equilibrado", speed: 65, odd: 2.5, emoji: "⬜" },
            { id: 3, name: "Pé de Pano", desc: "O Azarão Veloz", speed: 50, odd: 4.0, emoji: "🟫" },
            { id: 4, name: "Sombra", desc: "Correndo por Fora", speed: 55, odd: 3.5, emoji: "⬛" }
        ];
        
        const row = new ActionRowBuilder().addComponents(
            hList.map(h => createBtn(`hr_${h.id}`, `Apostar: ${h.name} (${h.odd}x)`, ButtonStyle.Secondary).setEmoji(h.emoji))
        );
        
        const paddock = new EmbedBuilder()
            .setTitle("🏇 Phantom Jockey Club - Paddock")
            .setDescription(`Seja bem-vindo ao Jockey Club! Você tem uma aposta de **${bet} pts** na mesa.\nEscolha o seu cavalo pelas Odds matematicamente geradas abaixo:`)
            .addFields(hList.map(h => ({ name: `${h.emoji} [${h.id}] ${h.name} - ${h.odd}x`, value: `*${h.desc}*` })))
            .setColor('#2E8B57')
            .setImage('https://i.imgur.com/K12345.png'); // fake banner
        
        const m = await msg.reply({ embeds: [paddock], components: [row] });
        
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        
        col.on('collect', async i => {
            const hId = parseInt(i.customId.split('_')[1]);
            const myHorse = hList.find(x => x.id === hId);
            col.stop();
            
            removePoints(msg.author.id, bet);
            
            let pos = [0, 0, 0, 0];
            const maxDist = 20;
            
            const renderTrack = (finisher = null) => {
                let track = "";
                for(let j=0; j<4; j++) {
                    const h = hList[j];
                    const p = Math.min(pos[j], maxDist);
                    const line = "█".repeat(p) + "💨" + h.emoji + "░".repeat(maxDist - p);
                    track += `${h.id}º | ${line} 🏁\n`;
                }
                let color = '#FFA500';
                let foot = "A corrida está acontecendo...";
                if(finisher) {
                    if(finisher.id === myHorse.id) {
                        color = '#00FF00'; foot = `🎉 VITÓRIA! Seu cavalo ganhou!`;
                    } else {
                        color = '#FF0000'; foot = `❌ DERROTA! O cavalo ${finisher.name} ganhou.`;
                    }
                }
                
                return new EmbedBuilder()
                    .setTitle("🏇 Phantom Grand Prix")
                    .setDescription(`\`\`\`\n${track}\n\`\`\`\n**Aposta:** ${bet} pts | **Seu Cavalo:** ${myHorse.name}`)
                    .setColor(color)
                    .setFooter({text: foot});
            };
            
            await i.update({ embeds: [renderTrack()], components: [] });
            
            let winner = null;
            while(!winner) {
                await wait(1500);
                for(let j=0; j<4; j++) {
                    const adv = Math.floor(Math.random() * 4) + (Math.random()*100 < hList[j].speed ? 1 : 0);
                    pos[j] += adv;
                    if(pos[j] >= maxDist && !winner) winner = hList[j];
                }
                
                if(winner) {
                    let winAmt = 0;
                    if(winner.id === myHorse.id) {
                        winAmt = Math.floor(bet * myHorse.odd);
                        addPoints(msg.author.id, winAmt);
                    }
                    await m.edit({ embeds: [renderTrack(winner)] }).catch(()=>{});
                    if(winAmt > 0) m.reply(`💰 Você faturou **${winAmt} pts** com o cavalo ${myHorse.name}!`);
                } else {
                    await m.edit({ embeds: [renderTrack()] }).catch(()=>{});
                }
            }
        });
    },

    // 5. High-Fidelity SportsBet
    sports: async (msg) => {
        const matches = [
            { id: 101, a: "Flamengo", b: "Palmeiras", sA: 88, sB: 85, league: "🇧🇷 Brasileirão Série A" },
            { id: 102, a: "São Paulo", b: "Corinthians", sA: 82, sB: 80, league: "🇧🇷 Brasileirão Série A" },
            { id: 201, a: "Real Madrid", b: "Man. City", sA: 95, sB: 95, league: "🇪🇺 Champions League" },
            { id: 202, a: "Bayern Munich", b: "Arsenal", sA: 90, sB: 88, league: "🇪🇺 Champions League" },
            { id: 301, a: "Brasil", b: "França", sA: 92, sB: 93, league: "🌍 Amistoso Internacional" }
        ];
        
        let desc = "📅 **Boletim de Partidas Reais - Phantom Bet**\n\n";
        for(let m of matches) {
            const total = m.sA + m.sB + 30;
            const oA = (1 / (m.sA / total) * 0.95).toFixed(2);
            const oX = (1 / (30 / total) * 0.95).toFixed(2);
            const oB = (1 / (m.sB / total) * 0.95).toFixed(2);
            
            desc += `**[ID: ${m.id}]** ${m.league}\n`;
            desc += `⚽ **${m.a}** vs **${m.b}**\n`;
            desc += `🔹 [1] Vitória ${m.a}: **${oA}x** | [X] Empate: **${oX}x** | [2] Vitória ${m.b}: **${oB}x**\n\n`;
        }
        
        desc += `Para apostar, use: \`.phantom sportsbet <aposta> <ID> <1/X/2>\``;
        msg.reply({ embeds: [new EmbedBuilder().setTitle("⚽ Phantom Sports - Painel de Cotações").setDescription(desc).setColor('#00FF00')] });
    },
    sportsbet: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const matchId = parseInt(args[1]);
        const pick = args[2]?.toUpperCase();
        
        const matches = [
            { id: 101, a: "Flamengo", b: "Palmeiras", sA: 88, sB: 85, league: "🇧🇷 Brasileirão Série A" },
            { id: 102, a: "São Paulo", b: "Corinthians", sA: 82, sB: 80, league: "🇧🇷 Brasileirão Série A" },
            { id: 201, a: "Real Madrid", b: "Man. City", sA: 95, sB: 95, league: "🇪🇺 Champions League" },
            { id: 202, a: "Bayern Munich", b: "Arsenal", sA: 90, sB: 88, league: "🇪🇺 Champions League" },
            { id: 301, a: "Brasil", b: "França", sA: 92, sB: 93, league: "🌍 Amistoso Internacional" }
        ];
        
        const match = matches.find(m => m.id === matchId);
        if(!match) return msg.reply("❌ ID não encontrado. Use `.phantom sports`.");
        if(!['1','X','2'].includes(pick)) return msg.reply("❌ Aposta inválida. Use 1, X ou 2.");
        
        removePoints(msg.author.id, bet);
        
        const total = match.sA + match.sB + 30;
        const odds = {
            '1': (1 / (match.sA / total) * 0.95).toFixed(2),
            'X': (1 / (30 / total) * 0.95).toFixed(2),
            '2': (1 / (match.sB / total) * 0.95).toFixed(2)
        };
        const myOdd = odds[pick];
        
        const renderMatch = (time, sA, sB, isEnd = false) => {
            const clock = isEnd ? "FIM DE JOGO" : `${time}' MIN`;
            const txt = `\`\`\`ansi\n${ansi.bgGreen}${ansi.white} ⏰ ${clock.padEnd(15, ' ')} ${ansi.reset}\n\n`;
            const scoreboard = `${match.a.padStart(15, ' ')} [ ${sA} x ${sB} ] ${match.b.padEnd(15, ' ')}\n\`\`\``;
            
            let color = isEnd ? ( (sA>sB?'1':(sA<sB?'2':'X')) === pick ? '#00FF00' : '#FF0000' ) : '#FFFF00';
            
            return new EmbedBuilder()
                .setTitle(`🏟️ Transmissão ao Vivo: ${match.league}`)
                .setDescription(txt + scoreboard + `\n**Seu Palpite:** ${pick} (${myOdd}x) | **Aposta:** ${bet} pts`)
                .setColor(color);
        };
        
        const m = await msg.reply({ embeds: [renderMatch(0, 0, 0)] });
        
        let sA = 0, sB = 0;
        await wait(2000);
        // Simulando 1º Tempo
        for(let i=0; i<3; i++) {
            if(Math.random()*100 < (match.sA / 3)) sA++;
            if(Math.random()*100 < (match.sB / 3)) sB++;
        }
        await m.edit({ embeds: [renderMatch(45, sA, sB)] }).catch(()=>{});
        
        await wait(2000);
        // Simulando 2º Tempo
        for(let i=0; i<3; i++) {
            if(Math.random()*100 < (match.sA / 3)) sA++;
            if(Math.random()*100 < (match.sB / 3)) sB++;
        }
        
        const res = sA > sB ? '1' : (sA < sB ? '2' : 'X');
        const won = res === pick;
        const winAmt = won ? Math.floor(bet * parseFloat(myOdd)) : 0;
        
        if(won) addPoints(msg.author.id, winAmt);
        
        const endEmbed = renderMatch(90, sA, sB, true);
        endEmbed.setFooter({text: won ? `🎉 GREEN! Você faturou ${winAmt} pts!` : `❌ RED! Você perdeu ${bet} pts.`});
        await m.edit({ embeds: [endEmbed] }).catch(()=>{});
    },

    // 6. High-Fidelity Slots
    slots: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        const symbols = ['🍒', '🍋', '🍇', '🍉', '🔔', '💎', '🎰'];
        
        const r1 = Math.floor(Math.random() * symbols.length);
        const r2 = Math.floor(Math.random() * symbols.length);
        const r3 = Math.floor(Math.random() * symbols.length);
        
        const finalCols = [
            [symbols[(r1+2)%symbols.length], symbols[(r2+2)%symbols.length], symbols[(r3+2)%symbols.length]],
            [symbols[(r1+1)%symbols.length], symbols[(r2+1)%symbols.length], symbols[(r3+1)%symbols.length]],
            [symbols[r1], symbols[r2], symbols[r3]], // Center (Winning line)
            [symbols[(r1-1+symbols.length)%symbols.length], symbols[(r2-1+symbols.length)%symbols.length], symbols[(r3-1+symbols.length)%symbols.length]]
        ];
        
        const renderSlots = (stopIdx) => {
            let ui = "";
            for(let r=0; r<3; r++) { // 3 visible rows (offset +1, 0, -1)
                let rowStr = " ";
                for(let c=0; c<3; c++) {
                    if(c > stopIdx) {
                        rowStr += "[ 🔃 ] "; // Spinning blur
                    } else {
                        // 0 = top, 1 = mid, 2 = bottom
                        rowStr += `[ ${finalCols[r+1][c]} ] `;
                    }
                }
                if(r === 1) rowStr += " ⬅️"; // winning line pointer
                ui += rowStr + "\n";
            }
            
            const color = stopIdx === 2 ? '#FFFF00' : '#FF4500';
            return new EmbedBuilder()
                .setTitle("🎰 Phantom Caça-Níqueis")
                .setDescription(`\`\`\`\n+-------------------+\n${ui}+-------------------+\n\`\`\`\n**Aposta:** ${bet} pts`)
                .setColor(color);
        };
        
        const m = await msg.reply({ embeds: [renderSlots(-1)] });
        
        await wait(1200);
        await m.edit({ embeds: [renderSlots(0)] }).catch(()=>{});
        
        await wait(1200);
        await m.edit({ embeds: [renderSlots(1)] }).catch(()=>{});
        
        await wait(1200);
        
        // Final
        const f1 = symbols[r1]; const f2 = symbols[r2]; const f3 = symbols[r3];
        let won = false; let winAmt = 0;
        
        if(f1 === f2 && f2 === f3) {
            won = true;
            if(f1 === '🎰') winAmt = bet * 50;
            else if(f1 === '💎') winAmt = bet * 30;
            else winAmt = bet * 15;
        } else if (f1 === f2 || f2 === f3 || f1 === f3) {
            won = true;
            winAmt = bet * 3;
        }
        
        const endEmbed = renderSlots(2);
        if(won) {
            addPoints(msg.author.id, winAmt);
            endEmbed.setColor('#00FF00').setFooter({text: `🎉 JACKPOT! Você ganhou ${winAmt} pts!`});
        } else {
            endEmbed.setColor('#FF0000').setFooter({text: `❌ Não foi dessa vez. Perdeu ${bet} pts.`});
        }
        
        await m.edit({ embeds: [endEmbed] }).catch(()=>{});
    },

    // 7. High-Fidelity Mines
    mines: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const bombs = parseInt(args[1]) || 3;
        if(bombs < 1 || bombs > 20) return msg.reply("Escolha entre 1 e 20 bombas.");
        removePoints(msg.author.id, bet);
        
        let grid = Array(25).fill('gem');
        let placed = 0;
        while(placed < bombs) {
            let r = Math.floor(Math.random()*25);
            if(grid[r] === 'gem') { grid[r] = 'bomb'; placed++; }
        }
        
        let revealed = Array(25).fill(false);
        let mult = 1.0;
        let gemsFound = 0;
        
        const getBoard = (ended = false, explodeIdx = -1) => {
            const rows = [];
            for(let i=0; i<5; i++) {
                const r = new ActionRowBuilder();
                for(let j=0; j<5; j++) {
                    const idx = i*5+j;
                    let style = ButtonStyle.Secondary;
                    let emoji = '🟦';
                    if(revealed[idx] || ended) {
                        if(grid[idx] === 'bomb') {
                            emoji = idx === explodeIdx ? '💥' : '💣';
                            style = ButtonStyle.Danger;
                        } else {
                            emoji = '💎';
                            style = ButtonStyle.Success;
                        }
                    }
                    r.addComponents(new ButtonBuilder().setCustomId(`mine_${idx}`).setEmoji(emoji).setStyle(style).setDisabled(revealed[idx] || ended));
                }
                rows.push(r);
            }
            return rows;
        };
        
        const cRow = () => new ActionRowBuilder().addComponents(createBtn('cashout', `💰 CASHOUT (${Math.floor(bet*mult)} pts)`, ButtonStyle.Primary));
        
        const renderHUD = (ended = false, won = false) => {
            const safeLeft = 25 - bombs - gemsFound;
            const totalLeft = 25 - gemsFound;
            const bombChance = ((bombs / totalLeft) * 100).toFixed(1);
            
            const color = ended ? (won ? '#00FF00' : '#FF0000') : '#00BFFF';
            
            return new EmbedBuilder()
                .setTitle("💣 Phantom Mines")
                .setDescription(`**Aposta:** ${bet} pts\n**Bombas:** ${bombs}`)
                .addFields(
                    { name: 'Multiplicador', value: `**${mult.toFixed(2)}x**`, inline: true },
                    { name: 'Gemas Abertas', value: `**${gemsFound}**`, inline: true },
                    { name: 'Chance de Bomba', value: `**${bombChance}%**`, inline: true }
                )
                .setColor(color);
        };
        
        const m = await msg.reply({ embeds: [renderHUD()], components: [...getBoard(), cRow()] });
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 60000 });
        
        col.on('collect', async i => {
            if(i.customId === 'cashout') {
                const win = Math.floor(bet * mult);
                addPoints(msg.author.id, win);
                col.stop();
                await i.update({ embeds: [renderHUD(true, true).setFooter({text: `✅ Você saiu ileso e faturou ${win} pts!`})], components: getBoard(true) });
                return;
            }
            
            const idx = parseInt(i.customId.split('_')[1]);
            revealed[idx] = true;
            
            if(grid[idx] === 'bomb') {
                col.stop();
                await i.update({ embeds: [renderHUD(true, false).setFooter({text: `💥 KABUM! Você explodiu e perdeu ${bet} pts.`})], components: getBoard(true, idx) });
            } else {
                gemsFound++;
                mult += 0.1 + (bombs * 0.05);
                if(gemsFound === 25 - bombs) {
                    const win = Math.floor(bet * mult);
                    addPoints(msg.author.id, win);
                    col.stop();
                    await i.update({ embeds: [renderHUD(true, true).setFooter({text: `🏆 TABULEIRO LIMPO! Ganhou ${win} pts!`})], components: getBoard(true) });
                } else {
                    await i.update({ embeds: [renderHUD()], components: [...getBoard(), cRow()] });
                }
            }
        });
    },
\n};\nmodule.exports = casino;