
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
