
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
