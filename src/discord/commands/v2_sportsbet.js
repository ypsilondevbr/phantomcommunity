
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
