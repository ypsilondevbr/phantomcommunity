const fs = require('fs');

let bundle = fs.readFileSync('src/discord/commands/casino_bundle.js', 'utf8');

const helpers = `
const wait = ms => new Promise(res => setTimeout(res, ms));

const ansi = {
    red: "\\x1b[1;31m", green: "\\x1b[1;32m", yellow: "\\x1b[1;33m",
    blue: "\\x1b[1;34m", cyan: "\\x1b[1;36m", white: "\\x1b[1;37m",
    reset: "\\x1b[0m", bgRed: "\\x1b[41m", bgGreen: "\\x1b[42m"
};
`;

if (!bundle.includes('const wait =')) {
    bundle = bundle.replace('function checkBet', helpers + '\nfunction checkBet');
}

const aviator = fs.readFileSync('src/discord/commands/v2_aviator.js', 'utf8').trim();
const mines = fs.readFileSync('src/discord/commands/v2_mines.js', 'utf8').trim();
const roleta = fs.readFileSync('src/discord/commands/v2_roleta.js', 'utf8').trim();
const sportsbet = fs.readFileSync('src/discord/commands/v2_sportsbet.js', 'utf8').trim();
const slots = fs.readFileSync('src/discord/commands/v2_slots.js', 'utf8').trim();
const horserace = fs.readFileSync('src/discord/commands/v2_horserace.js', 'utf8').trim();
const crash = fs.readFileSync('src/discord/commands/v2_crash.js', 'utf8').trim();

bundle = bundle.replace(/\/\/ 1\. Aviator[\s\S]*?(?=\/\/ 2\. Mines)/, aviator + '\n\n    ');
bundle = bundle.replace(/\/\/ 2\. Mines[\s\S]*?(?=\/\/ 3\. Roleta)/, mines + '\n\n    ');
bundle = bundle.replace(/\/\/ 3\. Roleta[\s\S]*?(?=\/\/ 4\. SportsBet API)/, roleta + '\n\n    ');
bundle = bundle.replace(/\/\/ 4\. SportsBet API[\s\S]*?(?=\/\/ 5\. Blackjack)/, sportsbet + '\n\n    ');
bundle = bundle.replace(/\/\/ 6\. Slots[\s\S]*?(?=\/\/ 7\. HorseRace)/, slots + '\n\n    ');
bundle = bundle.replace(/\/\/ 7\. HorseRace[\s\S]*?(?=\/\/ 8\. Baccarat)/, horserace + '\n\n    ');
bundle = bundle.replace(/\/\/ 10\. Crash[\s\S]*?(?=\/\/ 11\. Plinko)/, crash + '\n\n    ');

fs.writeFileSync('src/discord/commands/casino_bundle.js', bundle);
console.log("Injected all V2 modules successfully!");
