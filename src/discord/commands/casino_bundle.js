const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addPoints, removePoints, getUserPoints } = require('../../database/db');

// Helper para validar aposta e saldo
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
    // 1. Aviator
    aviator: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        removePoints(msg.author.id, bet);
        
        let mult = 1.00;
        let crashed = false;
        // Crash point logic: 1% chance instant crash, otherwise exponential curve
        const crashPoint = Math.random() < 0.05 ? 1.00 : parseFloat((1.01 + Math.random()*5 + (Math.random()>0.8?Math.random()*15:0)).toFixed(2));
        
        const row = new ActionRowBuilder().addComponents(createBtn('cashout', `💰 CASHOUT`, ButtonStyle.Success));
        const m = await msg.reply({ content: `✈️ **Aviator** | Aposta: **${bet}**\nSubindo: **${mult.toFixed(2)}x**`, components: [row] });
        
        let interval;
        let active = true;
        
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 30000 });
        col.on('collect', async i => {
            if(!active) return;
            active = false;
            clearInterval(interval);
            const win = Math.floor(bet * mult);
            addPoints(msg.author.id, win);
            await i.update({ content: `✅ **Cashout Efetuado!**\nVocê saiu em **${mult.toFixed(2)}x** e ganhou **${win} pts**!`, components: [] });
            col.stop();
        });
        
        interval = setInterval(() => {
            if(!active) return;
            mult += 0.15 + (mult * 0.05);
            if(mult >= crashPoint) {
                active = false; clearInterval(interval);
                m.edit({ content: `💥 **CRASHED!**\nO avião fugiu em **${crashPoint.toFixed(2)}x**.\nVocê perdeu **${bet} pts**.`, components: [] });
                col.stop();
            } else {
                m.edit({ content: `✈️ **Aviator** | Aposta: **${bet}**\nSubindo: **${mult.toFixed(2)}x**`, components: [row] }).catch(()=>{});
            }
        }, 1500);
    },

    // 2. Mines
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
        
        const getBoard = (ended = false) => {
            const rows = [];
            for(let i=0; i<5; i++) {
                const r = new ActionRowBuilder();
                for(let j=0; j<5; j++) {
                    const idx = i*5+j;
                    let style = ButtonStyle.Secondary;
                    let emoji = '🟦';
                    if(revealed[idx] || ended) {
                        emoji = grid[idx] === 'bomb' ? '💣' : '💎';
                        style = grid[idx] === 'bomb' ? ButtonStyle.Danger : ButtonStyle.Success;
                    }
                    r.addComponents(new ButtonBuilder().setCustomId(`mine_${idx}`).setEmoji(emoji).setStyle(style).setDisabled(revealed[idx] || ended));
                }
                rows.push(r);
            }
            return rows;
        };
        
        const cRow = () => new ActionRowBuilder().addComponents(createBtn('cashout', `Cashout: ${Math.floor(bet*mult)} pts`, ButtonStyle.Primary));
        
        const m = await msg.reply({ content: `💣 **Mines** | Apostou **${bet}** | Bombas: **${bombs}**\nMultiplicador: **${mult.toFixed(2)}x**`, components: [...getBoard(), cRow()] });
        const col = m.createMessageComponentCollector({ filter: i=>i.user.id===msg.author.id, time: 60000 });
        
        col.on('collect', async i => {
            if(i.customId === 'cashout') {
                const win = Math.floor(bet * mult);
                addPoints(msg.author.id, win);
                await i.update({ content: `✅ **Retirada!** Você levou **${win} pts** (${mult.toFixed(2)}x).`, components: getBoard(true) });
                return col.stop();
            }
            const idx = parseInt(i.customId.split('_')[1]);
            revealed[idx] = true;
            if(grid[idx] === 'bomb') {
                await i.update({ content: `💥 **KABOOM!** Você atingiu uma mina e perdeu **${bet} pts**.`, components: getBoard(true) });
                return col.stop();
            } else {
                gemsFound++;
                // Multiplier formula based on odds
                let safeTiles = 25 - bombs;
                let prob = 1;
                for(let k=0; k<gemsFound; k++) prob *= (safeTiles - k) / (25 - k);
                mult = (1 / prob) * 0.95; // 5% edge
                
                if(gemsFound === safeTiles) {
                    const win = Math.floor(bet * mult);
                    addPoints(msg.author.id, win);
                    await i.update({ content: `🎉 **TABULEIRO LIMPO!** Você levou **${win} pts** (${mult.toFixed(2)}x).`, components: getBoard(true) });
                    return col.stop();
                } else {
                    await i.update({ content: `💎 Boa! Multiplicador subiu para **${mult.toFixed(2)}x**`, components: [...getBoard(), cRow()] });
                }
            }
        });
    },

    // 3. Roulette
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

    // 4. SportsBet API
    sports: async (msg) => {
        let desc = "📅 **Próximos Jogos:**\n\n";
        for(let m of sportsMatches) {
            const o = calcOdds(m);
            desc += `**[ID: ${m.id}]** ${m.a} vs ${m.b} (${m.league})\n`;
            desc += `🔹 Vitória ${m.a} (1): **${o.oddA}x** | Empate (X): **${o.oddX}x** | Vitória ${m.b} (2): **${o.oddB}x**\n\n`;
        }
        desc += `Para apostar, use: \`.phantom sportsbet <aposta> <ID> <1, X ou 2>\``;
        msg.reply({ embeds: [new EmbedBuilder().setTitle("⚽ Phantom Sports - Calendário de Apostas").setDescription(desc).setColor('#00FF00')] });
    },
    sportsbet: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const matchId = parseInt(args[1]);
        const pick = args[2]?.toUpperCase(); // 1, X, 2
        
        const match = sportsMatches.find(m => m.id === matchId);
        if(!match) return msg.reply("❌ Partida não encontrada. Use `.phantom sports` para ver o calendário.");
        if(!['1','X','2'].includes(pick)) return msg.reply("❌ Aposta inválida. Escolha `1` (Time A), `X` (Empate) ou `2` (Time B).");
        
        removePoints(msg.author.id, bet);
        const o = calcOdds(match);
        const myOdd = pick === '1' ? o.oddA : (pick === 'X' ? o.oddX : o.oddB);
        
        const m = await msg.reply(`⚽ **Aposta Registrada!**\nVocê apostou **${bet} pts** no palpite **${pick}** (Odd: ${myOdd}x).\n*Simulando a partida nos bastidores...*`);
        
        setTimeout(() => {
            // Simulate match
            let scoreA = 0, scoreB = 0;
            for(let i=0; i<5; i++) {
                if(Math.random()*100 < (match.sA / 2)) scoreA++;
                if(Math.random()*100 < (match.sB / 2)) scoreB++;
            }
            let res = 'X';
            if(scoreA > scoreB) res = '1';
            else if(scoreB > scoreA) res = '2';
            
            let winText = `Fim de Jogo: **${match.a} ${scoreA} x ${scoreB} ${match.b}**\n`;
            if(res === pick) {
                const win = Math.floor(bet * parseFloat(myOdd));
                addPoints(msg.author.id, win);
                winText += `🎉 **GREEN!** Seu palpite bateu. Você ganhou **${win} pts**!`;
            } else {
                winText += `❌ **RED!** Seu palpite não bateu. Perdeu os **${bet} pts**.`;
            }
            m.edit(winText);
        }, 5000);
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

    // 10. Crash
    crash: async (msg, args) => {
        const bet = checkBet(msg, args); if(!bet) return;
        const target = parseFloat(args[1]);
        if(isNaN(target) || target <= 1.0) return msg.reply("Defina um alvo de Crash válido maior que 1.0 (Ex: `.phantom crash 100 2.5`)");
        removePoints(msg.author.id, bet);
        
        const crashPoint = Math.random() < 0.05 ? 1.00 : parseFloat((1.01 + Math.random()*10).toFixed(2));
        const m = await msg.reply(`📈 Analisando o mercado... Alvo: **${target}x**`);
        setTimeout(() => {
            if(crashPoint >= target) {
                const win = Math.floor(bet * target);
                addPoints(msg.author.id, win);
                m.edit(`📉 Mercado crashou em **${crashPoint}x**!\n✅ **SUCESSO:** Bateu seu alvo e você levou **${win} pts**!`);
            } else {
                m.edit(`📉 Mercado crashou prematuramente em **${crashPoint}x**.\n❌ O gráfico não chegou no seu alvo. Você perdeu.`);
            }
        }, 2000);
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
