
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
