
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
