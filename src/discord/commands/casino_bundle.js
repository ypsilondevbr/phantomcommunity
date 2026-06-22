const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addPoints, removePoints, getUserPoints } = require('../../database/db');

// Helper para validar aposta e saldo

const wait = ms => new Promise(res => setTimeout(res, ms));

const ansi = {
    red: "\x1b[1;31m", green: "\x1b[1;32m", yellow: "\x1b[1;33m",
    blue: "\x1b[1;34m", cyan: "\x1b[1;36m", white: "\x1b[1;37m",
    reset: "\x1b[0m", bgRed: "\x1b[41m", bgGreen: "\x1b[42m"
};

function checkBet(msg, args) {
    if(!args || args.length === 0) {
        msg.reply("💰 **Uso incorreto!** Você deve informar o valor da aposta. Ex: `.phantom <jogo> 50`");
        return null;
    }
    let amount = parseInt(args[0]);
    if(args[0].toLowerCase() === 'all') amount = getUserPoints(msg.author.id);
    if(isNaN(amount) || amount <= 0) {
        msg.reply("💰 O valor da aposta deve ser um número válido maior que 0.");
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

const suits = ['♠️','♥️','♦️','♣️'];
const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const getDeck = () => { let d=[]; for(let s of suits) for(let r of ranks) d.push({s,r}); return d.sort(()=>0.5-Math.random()); };
const cardVal = (r) => ['J','Q','K'].includes(r) ? 10 : (r==='A'?11:parseInt(r));

const sportsMatches = [
    { id: 1, a: "Flamengo", b: "Vasco", sA: 85, sB: 65, league: "Brasileirão" },
    { id: 2, a: "Real Madrid", b: "Barcelona", sA: 92, sB: 90, league: "La Liga" },
    { id: 3, a: "Brasil", b: "Argentina", sA: 95, sB: 93, league: "Copa do Mundo" },
    { id: 4, a: "Manchester City", b: "Arsenal", sA: 94, sB: 88, league: "Premier League" },
    { id: 5, a: "Corinthians", b: "Palmeiras", sA: 78, sB: 88, league: "Brasileirão" },
    { id: 6, a: "Bayern de Munique", b: "Borussia Dortmund", sA: 90, sB: 80, league: "Bundesliga" },
    { id: 7, a: "França", b: "Inglaterra", sA: 93, sB: 88, league: "Copa do Mundo" },
    { id: 8, a: "LOUD", b: "paiN Gaming", sA: 85, sB: 82, league: "CBLOL" }
];

function calcOdds(match) {
    const total = match.sA + match.sB + 30; // 30 is draw weight
    const pA = match.sA / total; const pB = match.sB / total; const pX = 30 / total;
    return { 
        oddA: (1/pA * 0.95).toFixed(2), 
        oddX: (1/pX * 0.95).toFixed(2), 
        oddB: (1/pB * 0.95).toFixed(2) 
    };
}

const casino = {
    // 1. High-Fidelity Aviator
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
    },

    // 2. Mines
    // 7. High-Fidelity Mines
    mines: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const bombs = parseInt(args[1]) || 3;
        if(bombs < 1 || bombs > 20) return msg.reply("Escolha entre 1 e 20 bombas.");
        removePoints(msg.author.id, bet);
        
        let grid = Array(16).fill('gem');
        let placed = 0;
        while(placed < bombs) {
            let r = Math.floor(Math.random()*16);
            if(grid[r] === 'gem') { grid[r] = 'bomb'; placed++; }
        }
        
        let revealed = Array(16).fill(false);
        let mult = 1.0;
        let gemsFound = 0;
        
        const getBoard = (ended = false, explodeIdx = -1) => {
            const rows = [];
            for(let i=0; i<4; i++) {
                const r = new ActionRowBuilder();
                for(let j=0; j<4; j++) {
                    const idx = i*4+j;
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
            const safeLeft = 16 - bombs - gemsFound;
            const totalLeft = 16 - gemsFound;
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
                if(gemsFound === 16 - bombs) {
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

    roleta: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const target = args[1]?.toLowerCase();
        if(!['red','black','green'].includes(target) && isNaN(parseInt(target))) {
            return msg.reply("Aposte em `red`, `black`, `green` ou um número de `0` a `36`.");
        }
        removePoints(msg.author.id, bet);
        
        const num = Math.floor(Math.random() * 37);
        let color = 'green';
        if(num!==0) color = (num%2===0) ? 'black' : 'red'; // Simplification of standard roulette colors
        
        let winMult = 0;
        if(target === color) winMult = target === 'green' ? 14 : 2;
        else if(parseInt(target) === num) winMult = 35;
        
        const m = await msg.reply("🎰 A roleta está girando...");
        setTimeout(() => {
            if(winMult > 0) {
                const win = bet * winMult;
                addPoints(msg.author.id, win);
                m.edit(`🎰 Caiu em **${num} ${color.toUpperCase()}**!\n🎉 **Você ganhou ${win} pts! (${winMult}x)**`);
            } else {
                m.edit(`🎰 Caiu em **${num} ${color.toUpperCase()}**!\n❌ Você perdeu os **${bet} pts**.`);
            }
        }, 2000);
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

    // 5. Blackjack
    blackjack: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        let deck = getDeck();
        let pHand = [deck.pop(), deck.pop()];
        let dHand = [deck.pop(), deck.pop()];
        const score = (h) => h.reduce((a,b)=>a+cardVal(b.r),0);
        
        const render = (hidden=true) => `🃏 **Blackjack** | Aposta: **${bet}**\nSua Mão: ${pHand.map(c=>c.r+c.s).join(' ')} (Pontos: **${score(pHand)}**)\nMão da Banca: ${hidden ? dHand[0].r+dHand[0].s+' ❓' : dHand.map(c=>c.r+c.s).join(' ')} (Pontos: **${hidden ? cardVal(dHand[0].r) : score(dHand)}**)`;
        
        const row = new ActionRowBuilder().addComponents(createBtn('hit', 'Comprar 🃏', ButtonStyle.Primary), createBtn('stand', 'Parar 🛑', ButtonStyle.Danger));
        const m = await msg.reply({ content: render(), components: [row] });
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        
        col.on('collect', async i => {
            if(i.customId === 'hit') {
                pHand.push(deck.pop());
                if(score(pHand) > 21) {
                    await i.update({ content: `${render(false)}\n💥 **Estourou 21! Você perdeu!**`, components: [] });
                    return col.stop();
                } else await i.update({ content: render(), components: [row] });
            } else {
                while(score(dHand) < 17) dHand.push(deck.pop());
                let ps = score(pHand), ds = score(dHand);
                let txt = `${render(false)}\n`;
                if(ds > 21 || ps > ds) {
                    addPoints(msg.author.id, bet * 2);
                    txt += `🎉 **VOCÊ VENCEU A BANCA! (+${bet*2} pts)**`;
                } else if(ps === ds) {
                    addPoints(msg.author.id, bet); // push
                    txt += `🤝 **EMPATE!** Fichas devolvidas.`;
                } else {
                    txt += `❌ **A BANCA VENCEU.**`;
                }
                await i.update({ content: txt, components: [] });
                col.stop();
            }
        });
    },

    // 6. Slots
    slots: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        const emojis = ['🍒', '🍇', '🔔', '💎', '7️⃣'];
        const m = await msg.reply("🎰 **Girando as máquinas...**");
        setTimeout(() => {
            const r = () => emojis[Math.floor(Math.random() * emojis.length)];
            const res = [r(), r(), r()];
            let winMult = 0;
            if(res[0]===res[1] && res[1]===res[2]) {
                if(res[0]==='7️⃣') winMult = 20;
                else if(res[0]==='💎') winMult = 10;
                else winMult = 5;
            } else if (res[0]===res[1] || res[1]===res[2] || res[0]===res[2]) {
                winMult = 1.5;
            }
            if(winMult > 0) {
                const win = Math.floor(bet * winMult);
                addPoints(msg.author.id, win);
                m.edit(`🎰 **SLOTS** 🎰\n[ ${res.join(' | ')} ]\n🎉 **Você ganhou ${win} pts! (${winMult}x)**`);
            } else {
                m.edit(`🎰 **SLOTS** 🎰\n[ ${res.join(' | ')} ]\n❌ **Nenhuma combinação. Perdeu.**`);
            }
        }, 1500);
    },

    // 7. Horse Race (Apostável)
    horserace: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const horsePick = parseInt(args[1]);
        if(![1,2,3].includes(horsePick)) return msg.reply("Especifique em qual cavalo vai apostar: `1`, `2` ou `3`.\nEx: `.phantom horserace 50 2`");
        
        removePoints(msg.author.id, bet);
        const odds = [parseFloat((1.5+Math.random()*2).toFixed(2)), parseFloat((1.5+Math.random()*2).toFixed(2)), parseFloat((1.5+Math.random()*2).toFixed(2))];
        
        let h = [0,0,0];
        const render = () => `🏇 **Hipódromo Phantom** | Aposta: **${bet} no Cavalo ${horsePick}**\n🏁 ${'➖'.repeat(10-h[0])}🐎 ${'➖'.repeat(h[0])} (1) [${odds[0]}x]\n🏁 ${'➖'.repeat(10-h[1])}🐎 ${'➖'.repeat(h[1])} (2) [${odds[1]}x]\n🏁 ${'➖'.repeat(10-h[2])}🐎 ${'➖'.repeat(h[2])} (3) [${odds[2]}x]`;
        const m = await msg.reply(render());
        const inter = setInterval(() => {
            h[0] += Math.floor(Math.random()*3); h[1] += Math.floor(Math.random()*3); h[2] += Math.floor(Math.random()*3);
            let winner = -1;
            if(h[0]>=10) winner = 1; else if(h[1]>=10) winner = 2; else if(h[2]>=10) winner = 3;
            
            if(winner !== -1) {
                clearInterval(inter);
                let txt = render() + `\n\n🏆 **CAVALO ${winner} VENCEU!** `;
                if(winner === horsePick) {
                    const win = Math.floor(bet * odds[winner-1]);
                    addPoints(msg.author.id, win);
                    txt += `🎉 **Você lucrou ${win} pts!**`;
                } else txt += `❌ Você perdeu.`;
                m.edit(txt);
            } else m.edit(render());
        }, 1500);
    },

    // 8. Baccarat
    baccarat: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const pick = args[1]?.toLowerCase();
        if(!['player','banker','tie'].includes(pick)) return msg.reply("Aposte em `player`, `banker` ou `tie`.");
        removePoints(msg.author.id, bet);
        
        let pScore = Math.floor(Math.random()*9)+1; let bScore = Math.floor(Math.random()*9)+1;
        let res = 'tie'; if(pScore>bScore) res = 'player'; else if(bScore>pScore) res = 'banker';
        
        let txt = `🃏 **Baccarat**\nJogador: **${pScore}** | Banca: **${bScore}**\nResultado: **${res.toUpperCase()}**\n`;
        if(pick === res) {
            const mult = res === 'tie' ? 8 : 2;
            addPoints(msg.author.id, bet * mult);
            txt += `🎉 **Você acertou! Ganhou ${bet*mult} pts!**`;
        } else txt += `❌ Você errou e perdeu a aposta.`;
        msg.reply(txt);
    },

    // 9. Colorbet
    colorbet: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        const row = new ActionRowBuilder().addComponents(createBtn('red', 'Vermelho', ButtonStyle.Danger), createBtn('blue', 'Azul', ButtonStyle.Primary));
        const m = await msg.reply({ content: `Aposta: **${bet}**. Escolha uma cor! (Prêmio 1.9x)`, components: [row] });
        m.awaitMessageComponent({ filter: i=>i.user.id===msg.author.id, time: 10000 }).then(i => {
            const w = Math.random()>0.5 ? 'red' : 'blue';
            if(i.customId === w) { 
                addPoints(msg.author.id, Math.floor(bet*1.9)); 
                i.update({ content: `🎨 Deu ${w==='red'?'Vermelho':'Azul'}! Você ganhou **${Math.floor(bet*1.9)} pts**!`, components: [] }); 
            } else i.update({ content: `🎨 Deu ${w==='red'?'Vermelho':'Azul'}! Você perdeu.`, components: [] });
        }).catch(()=>{});
    },

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

    // 11. Plinko (Simulado via botões e caindo)
    plinko: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        const mults = [0.2, 0.5, 1.1, 2.0, 5.0, 2.0, 1.1, 0.5, 0.2];
        let pos = 4; // Start center
        const m = await msg.reply(`🎱 Soltando a bolinha...`);
        for(let i=0; i<6; i++) {
            setTimeout(() => { pos += Math.random()>0.5 ? 1 : -1; }, i*500);
        }
        setTimeout(() => {
            if(pos<0) pos=0; if(pos>8) pos=8;
            const mult = mults[pos];
            const win = Math.floor(bet * mult);
            addPoints(msg.author.id, win);
            m.edit(`🎱 A bolinha caiu na gaveta de **${mult}x**!\nVocê resgatou **${win} pts**.`);
        }, 3500);
    },

    // 12. Dicebet
    dicebet: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const type = args[1]?.toLowerCase(); // over ou under
        const num = parseInt(args[2]);
        if(!['over','under'].includes(type) || isNaN(num) || num<1 || num>99) return msg.reply("Uso: `.phantom dicebet 50 <over/under> <1-99>`");
        
        removePoints(msg.author.id, bet);
        const roll = Math.floor(Math.random()*100)+1;
        
        let win = false;
        let odd = 1;
        if(type === 'over') { win = roll > num; odd = 99 / (100 - num); }
        if(type === 'under') { win = roll < num; odd = 99 / (num - 1); }
        
        if(win) {
            const prize = Math.floor(bet * odd * 0.95);
            addPoints(msg.author.id, prize);
            msg.reply(`🎲 Dado rolou: **${roll}**!\n✅ **GREEN!** Sua previsão bateu. Ganhou **${prize} pts** (Odd: ${odd.toFixed(2)}x)`);
        } else {
            msg.reply(`🎲 Dado rolou: **${roll}**!\n❌ **RED.** Você perdeu.`);
        }
    },

    // 13. Limbo
    limbo: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const target = parseFloat(args[1]);
        if(isNaN(target) || target < 1.01) return msg.reply("Alvo mínimo é 1.01x");
        removePoints(msg.author.id, bet);
        
        const result = parseFloat((1.00 + Math.random()*100 / (Math.random()*10+1)).toFixed(2));
        if(result >= target) {
            const win = Math.floor(bet * target);
            addPoints(msg.author.id, win);
            msg.reply(`🛸 O Limbo voou até **${result}x**!\n🎉 Bateu no seu alvo! Você faturou **${win} pts**.`);
        } else {
            msg.reply(`🛸 O Limbo voou até **${result}x**...\n❌ Caiu antes do seu alvo. Você perdeu.`);
        }
    },

    // 14. Keno
    keno: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const picks = args.slice(1).map(n=>parseInt(n)).filter(n => !isNaN(n) && n>=1 && n<=20);
        if(picks.length < 1 || picks.length > 5) return msg.reply("Escolha entre 1 e 5 números únicos de 1 a 20. Ex: `.phantom keno 50 4 12 18`");
        removePoints(msg.author.id, bet);
        
        let draw = [];
        while(draw.length < 5) {
            let n = Math.floor(Math.random()*20)+1;
            if(!draw.includes(n)) draw.push(n);
        }
        
        let hits = picks.filter(p => draw.includes(p)).length;
        let mult = 0;
        if(picks.length===1 && hits===1) mult = 3.5;
        if(picks.length===2 && hits===2) mult = 12;
        if(picks.length===3 && hits===2) mult = 2;
        if(picks.length===3 && hits===3) mult = 40;
        if(picks.length===4 && hits===3) mult = 5;
        if(picks.length===4 && hits===4) mult = 100;
        if(picks.length===5 && hits===3) mult = 3;
        if(picks.length===5 && hits===4) mult = 20;
        if(picks.length===5 && hits===5) mult = 300;
        
        let txt = `🎱 **Keno** | Seus números: ${picks.join(', ')}\nSorteio Oficial: **${draw.join(', ')}**\nAcertos: **${hits}**\n`;
        if(mult > 0) {
            const win = Math.floor(bet * mult);
            addPoints(msg.author.id, win);
            txt += `🎉 **Vitória Extrema! (${mult}x) Ganhou ${win} pts!**`;
        } else txt += `❌ Sem prêmios de acerto. Você perdeu.`;
        msg.reply(txt);
    },

    // 15. Scratchcard (Raspadinha)
    scratchcard: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        const em = ['🍒','🍒','🍒','🍒','🍒','💎','💎','💎','7️⃣','7️⃣'];
        const grid = Array(9).fill().map(()=>em[Math.floor(Math.random()*em.length)]);
        
        const m = await msg.reply(`🎟️ **Raspando cartão...**`);
        setTimeout(() => {
            let win = false; let mult = 0;
            // Check rows
            for(let i=0; i<3; i++) {
                if(grid[i*3]===grid[i*3+1] && grid[i*3+1]===grid[i*3+2]) {
                    win = true; mult = grid[i*3]==='7️⃣' ? 10 : (grid[i*3]==='💎'?5:2);
                }
            }
            let txt = `🎟️ **Raspadinha**\n[ ${grid[0]} | ${grid[1]} | ${grid[2]} ]\n[ ${grid[3]} | ${grid[4]} | ${grid[5]} ]\n[ ${grid[6]} | ${grid[7]} | ${grid[8]} ]\n`;
            if(win) {
                addPoints(msg.author.id, bet * mult);
                txt += `🎉 **Achou trinca! Ganhou ${bet*mult} pts! (${mult}x)**`;
            } else txt += `❌ Nada encontrado. Bilhete premiado não foi dessa vez.`;
            m.edit(txt);
        }, 2000);
    },

    // 16. Tower
    tower: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        let level = 1; let mult = 1.0;
        const row = () => new ActionRowBuilder().addComponents(createBtn('1', 'Porta 1', ButtonStyle.Secondary), createBtn('2', 'Porta 2', ButtonStyle.Secondary), createBtn('3', 'Porta 3', ButtonStyle.Secondary), createBtn('cashout', 'Cashout', ButtonStyle.Success));
        const m = await msg.reply({ content: `🗼 **A Torre** | Aposta: **${bet}**\nAndar: **${level}** | Multiplicador: **${mult}x**\nEscolha uma porta! (1 Bomba, 2 Seguras)`, components: [row()] });
        
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        col.on('collect', async i => {
            if(i.customId === 'cashout') {
                const win = Math.floor(bet * mult); addPoints(msg.author.id, win);
                await i.update({ content: `✅ **Cashout!** Fugiu da torre no Andar ${level} e levou **${win} pts**!`, components: [] }); return col.stop();
            }
            const bomb = Math.floor(Math.random()*3)+1;
            if(parseInt(i.customId) === bomb) {
                await i.update({ content: `💥 **KABOOM!** Tinha um monstro na Porta ${i.customId} (Andar ${level}). Você perdeu a aposta.`, components: [] }); return col.stop();
            } else {
                level++; mult = parseFloat((mult * 1.45).toFixed(2));
                if(level > 5) {
                    const win = Math.floor(bet * mult); addPoints(msg.author.id, win);
                    await i.update({ content: `🏆 **TOPO DA TORRE ALCANÇADO!**\nVocê zerou a torre e ganhou **${win} pts (${mult}x)**!`, components: [] }); return col.stop();
                } else {
                    await i.update({ content: `🗼 **A Torre** | Aposta: **${bet}**\nAndar: **${level}** | Multiplicador: **${mult}x**\nEscolha a próxima porta!`, components: [row()] });
                }
            }
        });
    },

    // 17. HiLo
    hilo: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        let deck = getDeck();
        let curr = deck.pop(); let mult = 1.0;
        
        const row = () => new ActionRowBuilder().addComponents(createBtn('higher', 'Maior ⬆️', ButtonStyle.Primary), createBtn('lower', 'Menor ⬇️', ButtonStyle.Danger), createBtn('cashout', 'Cashout 💰', ButtonStyle.Success));
        const m = await msg.reply({ content: `🃏 **HiLo** | Aposta: **${bet}**\nCarta na Mesa: **${curr.r}${curr.s}**\nA próxima é Maior ou Menor? (Mult: **${mult.toFixed(2)}x**)`, components: [row()] });
        
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        col.on('collect', async i => {
            if(i.customId === 'cashout') {
                const win = Math.floor(bet * mult); addPoints(msg.author.id, win);
                await i.update({ content: `✅ **Saída Tática!** Levou **${win} pts** (${mult.toFixed(2)}x).`, components: [] }); return col.stop();
            }
            let next = deck.pop();
            let cV = cardVal(curr.r); let nV = cardVal(next.r);
            let win = false;
            if(i.customId === 'higher' && nV >= cV) win = true;
            if(i.customId === 'lower' && nV <= cV) win = true;
            
            if(win) {
                let prob = i.customId === 'higher' ? (14 - cV)/13 : (cV - 1)/13;
                if(prob <= 0) prob = 0.1;
                mult = parseFloat((mult + (0.5 / prob)).toFixed(2));
                curr = next;
                await i.update({ content: `🃏 **HiLo** | Aposta: **${bet}**\nCarta na Mesa: **${curr.r}${curr.s}**\nAcertou! A próxima é Maior ou Menor? (Mult: **${mult.toFixed(2)}x**)`, components: [row()] });
            } else {
                await i.update({ content: `❌ **Errou!** A carta era **${next.r}${next.s}**. Você perdeu a aposta.`, components: [] }); return col.stop();
            }
        });
    },

    // 18. Video Poker
    videopoker: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        let deck = getDeck();
        let hand = [deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
        
        const row = () => new ActionRowBuilder().addComponents(
            ...hand.map((c, idx) => createBtn(`hold_${idx}`, `${c.r}${c.s}`, ButtonStyle.Secondary)),
            createBtn('draw', '🔄 TROCAR', ButtonStyle.Primary)
        );
        let holds = [false,false,false,false,false];
        
        const m = await msg.reply({ content: `🃏 **Video Poker** | Aposta: **${bet}**\nClique nas cartas que deseja **MANTER** e depois em Trocar.`, components: [row()] });
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        
        col.on('collect', async i => {
            if(i.customId.startsWith('hold_')) {
                const idx = parseInt(i.customId.split('_')[1]);
                holds[idx] = !holds[idx];
                const newRow = new ActionRowBuilder().addComponents(
                    ...hand.map((c, jdx) => createBtn(`hold_${jdx}`, `${c.r}${c.s}`, holds[jdx] ? ButtonStyle.Success : ButtonStyle.Secondary)),
                    createBtn('draw', '🔄 TROCAR', ButtonStyle.Primary)
                );
                await i.update({ components: [newRow] });
            } else if(i.customId === 'draw') {
                for(let j=0; j<5; j++) if(!holds[j]) hand[j] = deck.pop();
                // Hand evaluation (simplified)
                const vals = hand.map(c=>cardVal(c.r)).sort((a,b)=>a-b);
                const isFlush = hand.every(c=>c.s === hand[0].s);
                const isStraight = vals.every((v, idx)=>idx===0||v===vals[idx-1]+1);
                
                let counts = {}; vals.forEach(v => counts[v] = (counts[v]||0)+1);
                const pairs = Object.values(counts).filter(c=>c===2).length;
                const threes = Object.values(counts).filter(c=>c===3).length;
                const fours = Object.values(counts).filter(c=>c===4).length;
                
                let mult = 0; let resTxt = "Sem Jogo";
                if(isFlush && isStraight) { mult = 50; resTxt = "Straight Flush"; }
                else if(fours === 1) { mult = 25; resTxt = "Quadra"; }
                else if(threes === 1 && pairs === 1) { mult = 9; resTxt = "Full House"; }
                else if(isFlush) { mult = 6; resTxt = "Flush"; }
                else if(isStraight) { mult = 4; resTxt = "Straight"; }
                else if(threes === 1) { mult = 3; resTxt = "Trinca"; }
                else if(pairs === 2) { mult = 2; resTxt = "Dois Pares"; }
                else if(pairs === 1 && vals.some(v=>v>=11 && counts[v]===2)) { mult = 1; resTxt = "Par (Valetes ou Melhor)"; }
                
                let endTxt = `🃏 **Video Poker Final:** ${hand.map(c=>c.r+c.s).join(' ')}\nMão: **${resTxt}**\n`;
                if(mult > 0) {
                    addPoints(msg.author.id, bet * mult);
                    endTxt += `🎉 **Você ganhou ${bet*mult} pts! (${mult}x)**`;
                } else endTxt += `❌ **Você perdeu sua aposta.**`;
                
                await i.update({ content: endTxt, components: [] });
                col.stop();
            }
        });
    },

    // 19. Wheel of Fortune
    wheel: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        const segments = [0, 1.5, 0.5, 2.0, 0, 1.2, 3.0, 0, 1.5, 5.0];
        const m = await msg.reply(`🎡 **Girando a Roda da Fortuna...**`);
        setTimeout(() => {
            const result = segments[Math.floor(Math.random()*segments.length)];
            const win = Math.floor(bet * result);
            if(result > 0) {
                addPoints(msg.author.id, win);
                m.edit(`🎡 A Roda parou em **${result}x**!\n🎉 Você faturou **${win} pts**!`);
            } else m.edit(`🎡 A Roda parou em **0x**...\n❌ Você quebrou e perdeu a aposta.`);
        }, 2000);
    },

    // 20. Coinflip Casino
    coinflip: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const pick = args[1]?.toLowerCase();
        if(!['heads','tails','cara','coroa'].includes(pick)) return msg.reply("Escolha `cara` (heads) ou `coroa` (tails).");
        removePoints(msg.author.id, bet);
        
        const isHeads = Math.random() > 0.5;
        const botSide = isHeads ? 'cara' : 'coroa';
        const userSide = (pick === 'heads' || pick === 'cara') ? 'cara' : 'coroa';
        
        if(botSide === userSide) {
            addPoints(msg.author.id, Math.floor(bet*1.9));
            msg.reply(`🪙 Caiu **${botSide.toUpperCase()}**!\n🎉 **Você dobrou! Ganhou ${Math.floor(bet*1.9)} pts (1.9x)**`);
        } else {
            msg.reply(`🪙 Caiu **${botSide.toUpperCase()}**!\n❌ Você perdeu os **${bet} pts**.`);
        }
    }
};

module.exports = casino;
