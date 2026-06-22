
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
