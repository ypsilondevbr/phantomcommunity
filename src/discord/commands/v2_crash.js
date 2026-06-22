
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
