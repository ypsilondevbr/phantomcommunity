const fs = require('fs');
const oldCasino = require('./src/discord/commands/casino_bundle.js');
const v2Casino = require('./src/discord/commands/casino_v2.js');

const merged = { ...oldCasino, ...v2Casino };

let fileOutput = `const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addPoints, removePoints, getUserPoints } = require('../../database/db');

const wait = ms => new Promise(res => setTimeout(res, ms));

const ansi = {
    red: "\\x1b[1;31m", green: "\\x1b[1;32m", yellow: "\\x1b[1;33m",
    blue: "\\x1b[1;34m", cyan: "\\x1b[1;36m", white: "\\x1b[1;37m",
    reset: "\\x1b[0m", bgRed: "\\x1b[41m", bgGreen: "\\x1b[42m"
};

function checkBet(msg, args) {
    if(!args || args.length === 0) {
        msg.reply("💰 **Uso incorreto!** Você deve informar o valor da aposta. Ex: \`.phantom <jogo> 50\`. Use \`all\` para apostar tudo.");
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
        msg.reply(\`💸 **Saldo Insuficiente!** Você tem apenas **\${balance}** pontos.\`);
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

const casino = {
`;

for (const [key, func] of Object.entries(merged)) {
    // Because Node's toString() on an object property might look like `async (msg, args) => ...` or `async function(msg, args) ...`
    // We can just assign it to the key.
    fileOutput += `    ${key}: ${func.toString()},\n\n`;
}

fileOutput += `};

module.exports = casino;
`;

fs.writeFileSync('src/discord/commands/casino_bundle.js', fileOutput);
console.log('Merged successfully!');
