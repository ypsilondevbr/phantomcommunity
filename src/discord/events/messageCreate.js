const { handleAICommand } = require('../../ai/agent');
const banCommand = require('../commands/admin/ban');
const kickCommand = require('../commands/admin/kick');
const timeoutCommand = require('../commands/admin/timeout');
const warnCommand = require('../commands/admin/warn');
const userinfoCommand = require('../commands/admin/userinfo');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.content === '.phantomhelp') {
            const { EmbedBuilder } = require('discord.js');
            const helpEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🤖 Painel de Comandos - Phantom')
                .setDescription('**A IA trabalha de forma invisível via texto natural.** Mas se você quiser usar comandos manuais rápidos, temos **90 Comandos Clássicos** prontos para uso. Abaixo está a lista organizada:')
                .addFields(
                    { name: '🎰 CASSINO PHANTOM (APOSTAS REAIS)', value: '`.phantom aviator <aposta>` - Aviator ✈️\n`.phantom mines <aposta>` - Campo Minado 💎\n`.phantom roleta <aposta>` - Roleta Clássica\n`.phantom sports` - Ver Jogos ⚽\n`.phantom sportsbet <aposta> <ID> <1/X/2>` - Apostar\n`.phantom blackjack <aposta>` - Jogo 21\n`.phantom slots <aposta>` - Caça-Níquel\n`.phantom horserace <aposta> <1/2/3>` - Cavalos\n`.phantom baccarat <aposta> <1/X/2>` - Baccarat\n`.phantom colorbet <aposta>` - Cor\n`.phantom crash <aposta> <alvo>` - Crash Gráfico\n`.phantom plinko <aposta>` - Plinko 🎱\n`.phantom dicebet <aposta> <over/under> <n>` - Dado Odd\n`.phantom limbo <aposta> <alvo>` - Limbo\n`.phantom keno <aposta> <n>` - Loteria\n`.phantom scratchcard <aposta>` - Raspadinha\n`.phantom tower <aposta>` - Torre\n`.phantom hilo <aposta>` - Cartas\n`.phantom videopoker <aposta>` - Poker\n`.phantom wheel <aposta>` - Roda da Fortuna\n`.phantom coinflip <aposta> <cara/coroa>` - Cara/Coroa' },
                    { name: '🧹 Moderação Extra', value: '`.phantom unban <ID>` - Desbane\n`.phantom untimeout <@>` - Tira castigo\n`.phantom lock` - Tranca canal\n`.phantom unlock` - Destranca\n`.phantom clear <1-100>` - Apaga msgs\n`.phantom nuke` - Recria canal\n`.phantom mute <@>` - Muta\n`.phantom unmute <@>` - Desmuta\n`.phantom deafen <@>` - Ensurdece\n`.phantom undeafen <@>` - Desensurdece\n`.phantom addrole <@> <cargo>` - Dá cargo\n`.phantom removerole <@> <cargo>` - Tira\n`.phantom lockdown` - Tranca tudo\n`.phantom unlockdown` - Destranca' },
                    { name: 'ℹ️ Informação & Utils', value: '`.phantom serverinfo` - Server\n`.phantom botinfo` - Bot\n`.phantom avatar <@>` - Foto\n`.phantom ping` - Ping\n`.phantom uptime` - Tempo online\n`.phantom roles` - Cargos\n`.phantom emojis` - Emojis\n`.phantom invite` - Convite\n`.phantom math <conta>` - Calcula\n`.phantom nick <@> <nome>` - Apelido\n`.phantom setafk` - AFK\n`.phantom say <texto>` - Fala\n`.phantom embed <texto>` - Embed\n`.phantom poll <texto>` - Votação\n`.phantom giveaway <premio>` - Sorteio\n`.phantom move <@> <call>` - Move\n`.phantom disconnect <@>` - Derruba' },
                    { name: '🎭 Ações Sociais (GIFs)', value: '`.phantom slap <@>` - Tapa\n`.phantom hug <@>` - Abraça\n`.phantom kiss <@>` - Beija\n`.phantom punch <@>` - Soca\n`.phantom pat <@>` - Carinho\n`.phantom kill <@>` - Mata\n`.phantom bite <@>` - Morde\n`.phantom tickle <@>` - Cócegas\n`.phantom poke <@>` - Cutuca\n`.phantom highfive <@>` - Toca aqui\n`.phantom stare <@>` - Encara\n`.phantom cuddle <@>` - Aconchega\n`.phantom feed <@>` - Alimenta\n`.phantom wave` - Acena\n`.phantom dance` - Dança\n`.phantom cry` - Chora\n`.phantom laugh` - Ri\n`.phantom blush` - Corado\n`.phantom smug` - Convencido\n`.phantom pout` - Bico\n`.phantom confused` - Confuso\n`.phantom angry` - Bravo\n`.phantom happy` - Feliz\n`.phantom sad` - Triste\n`.phantom shocked` - Chocado\n`.phantom sleep` - Dorme\n`.phantom bored` - Tédio\n`.phantom wink` - Pisca' },
                    { name: '🕹️ Central de Jogos (1/2)', value: '`.phantom rank` - VER RANKING\n`.phantom tictactoe <@>` - Jogo da Velha\n`.phantom gunfight <@>` - Duelo de Arma\n`.phantom hangman` - Forca\n`.phantom russianroulette` - Roleta Russa\n`.phantom fastclick` - Clique rápido\n`.phantom mathquiz` - Conta rápida\n`.phantom scramble` - Desembaralha\n`.phantom minesweeper` - Campo Minado\n`.phantom guess` - Adivinhe nº\n`.phantom diceduel <@>` - Dados\n`.phantom truthordare` - Verdade/Desf\n`.phantom bomb` - Desarme a bomba\n`.phantom typeracer` - Digite!\n`.phantom wyr` - O que prefere?\n`.phantom memory` - Memória\n`.phantom fish` - Pesca\n`.phantom mine` - Minera' },
                    { name: '🕹️ Central de Jogos (2/2)', value: '`.phantom chop` - Corta\n`.phantom rob <@>` - Rouba\n`.phantom guessflag` - Bandeira\n`.phantom coinflipduel <@>` - Moeda\n`.phantom neverhaveiever` - Eu Nunca\n`.phantom higherlower` - + ou -\n`.phantom trivia` - Quiz\n`.phantom anagram` - Anagrama\n`.phantom roshambo` - PPT Botões\n`.phantom impostor` - Impostor\n`.phantom luckybox` - Sorte\n`.phantom snailrace` - Caracóis' },
                    { name: '🎲 Minigames Clássicos', value: '`.phantom 8ball <txt>` - Prevê futuro\n`.phantom roll` - Rola dado\n`.phantom rps <ppt>` - Jokenpô\n`.phantom meme` - Meme BR\n`.phantom joke` - Piada\n`.phantom dadjoke` - Tiozão\n`.phantom fact` - Fato\n`.phantom quote` - Frase\n`.phantom hack <@>` - Finge hackear\n`.phantom ship <@>` - Casal\n`.phantom marry <@>` - Casamento\n`.phantom divorce <@>` - Divórcio\n`.phantom reverse <txt>` - Inverte\n`.phantom mock <txt>` - fInGe\n`.phantom uwu <txt>` - fofo uwu' },
                    { name: '📊 Medidores & Zueira', value: '`.phantom insult <@>` - Insulta\n`.phantom compliment <@>` - Elogia\n`.phantom rate <@>` - Dá nota\n`.phantom pp <@>` - Mede o p*\n`.phantom gayrate <@>` - % Viadagem\n`.phantom simprate <@>` - % Gado\n`.phantom cornorate <@>` - % Corno\n`.phantom gadometro <@>` - % Gado\n`.phantom gostosorate <@>` - % Gostosura\n`.phantom machorate <@>` - % Macho Alfa\n`.phantom burrorate <@>` - % Burrice\n`.phantom feiorate <@>` - % Feiura\n`.phantom pobrerate <@>` - % Pobreza\n`.phantom iq <@>` - Mede o QI' },
                    { name: '🛡️ Comandos Bases (Owner)', value: '`.phantom ban <@>` - Ban\n`.phantom kick <@>` - Expulsa\n`.phantom timeout <@>` - Castiga\n`.phantom warn <@>` - Adverte\n`.phantom history <@>` - Histórico\n`.phantom userinfo <@>` - Ficha\n`.phantom status` - Status\n`.phantom debug` - Debug\n`.phantom addpoints <@> <qtd>` - Dá pts' }
                )
                .setFooter({ text: 'Phantom Classic Suite - 90 Comandos Ativos' })
                .setTimestamp();

            return message.reply({ embeds: [helpEmbed] });
        }

        const prefix = '.phantom';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        const userQuery = message.content.slice(prefix.length).trim();

        if (userQuery.length === 0 && !command) {
            return message.reply("Como posso ajudar? Digite `.phantomhelp` para ver as opções ou me peça o que quiser.");
        }

        // Comando secreto de diagnóstico para descobrir o que tem na API Key do cara
        if (command === 'debug') {
            if (message.author.id !== message.guild.ownerId) return message.reply("Apenas o dono do servidor pode ver o debug.");
            const key = process.env.GEMINI_API_KEY || "";
            const cleanKey = key.replace(/['"]/g, '').trim();
            const hasDots = key.includes(".");
            const startStr = key.substring(0, 4);
            const length = key.length;
            
            let diagMsg = `🔧 **Diagnóstico da GEMINI_API_KEY lida pela Railway:**\n\n- Começa com: \`${startStr}***\` (Deveria ser 'AIza' ou 'AQ.')\n- Possui pontos (.) na chave? **${hasDots ? 'SIM' : 'NÃO'}**\n- Tamanho da chave: **${length} caracteres**\n\n`;

            try {
                diagMsg += `⏳ Consultando os servidores do Google para ver quais modelos essa chave tem acesso...\n`;
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
                if (!response.ok) {
                    const errText = await response.text();
                    diagMsg += `❌ O Google rejeitou listar os modelos. Erro: ${response.status} - ${errText.substring(0, 500)}`;
                } else {
                    const data = await response.json();
                    if (data.models && data.models.length > 0) {
                        const modelNames = data.models.map(m => m.name).slice(0, 10).join("\n- ");
                        diagMsg += `✅ SUCESSO! A chave é válida. O Google diz que você pode usar os seguintes modelos:\n- ${modelNames}\n(Mostrando os 10 primeiros)`;
                    } else {
                        diagMsg += `⚠️ A chave é válida, mas o Google diz que não há NENHUM modelo disponível para essa conta!`;
                    }
                }
            } catch (err) {
                diagMsg += `❌ Erro de conexão com o Google: ${err.message}`;
            }
            
            return message.reply(diagMsg);
        }

        if (command === 'status') {
            return message.reply("✅ Status: Operacional\n🧠 IA: Google Gemini 2.5 Pro\n🗄️ Database: SQLite Online");
        }

        // Interceptador de Segurança (Restrição a Owner)
        const dangerousCommands = ['addpoints', 'ban', 'kick', 'timeout', 'warn', 'history', 'role', 'channel', 'unban', 'untimeout', 'lock', 'unlock', 'clear', 'nuke', 'mute', 'unmute', 'deafen', 'undeafen', 'addrole', 'removerole', 'lockdown', 'unlockdown', 'disconnect', 'move'];
        if (dangerousCommands.includes(command)) {
            const isGuildOwner = message.author.id === message.guild.ownerId;
            const hasOwnerRole = message.member.roles.cache.some(r => r.name.toLowerCase().includes('owner') || r.name.toLowerCase().includes('dono') || r.name.toLowerCase().includes('fundador'));
            if (!isGuildOwner && !hasOwnerRole) {
                return message.reply("⛔ **Acesso Negado:** Apenas o Owner do servidor tem permissão para usar comandos administrativos/prejudiciais.");
            }
        }

        if (command === 'ban') return banCommand.execute(message, args);
        if (command === 'kick') return kickCommand.execute(message, args);
        if (command === 'timeout') return timeoutCommand.execute(message, args);
        if (command === 'warn') return warnCommand.execute(message, args);
        if (command === 'userinfo') return userinfoCommand.execute(message, args);
        
        // Novos comandos
        if (command === 'history') {
            const historyCommand = require('../commands/admin/history');
            return historyCommand.execute(message, args, client);
        }
        if (command === 'role') {
            const roleCommand = require('../commands/admin/role');
            return roleCommand.execute(message, args);
        }
        if (command === 'channel') {
            const channelCommand = require('../commands/admin/channel');
            return channelCommand.execute(message, args);
        }
        if (command === 'addpoints') {
            const addpointsCommand = require('../commands/admin/addpoints');
            return addpointsCommand.execute(message, args);
        }

        // Executa comandos clássicos do Bundle
        const extraCommands = require('../commands/bundle');
        if (extraCommands[command]) {
            return extraCommands[command](message, args);
        }

        // Executa novos minigames (Motor Isolado)
        const minigameCommands = require('../commands/minigames_bundle');
        const casinoCommands = require('../commands/casino_bundle');
        if (casinoCommands[command]) return casinoCommands[command](message, args);
        if (minigameCommands[command]) {
            return minigameCommands[command](message, args);
        }

        // Comandos que ainda serão implementados e usarão sistemas / setups massivos
        const pendingCommands = ['category', 'setup', 'tickets', 'welcome', 'logs', 'backup', 'security', 'lockdown'];
        if (pendingCommands.includes(command)) {
            return message.reply(`⚠️ O comando fixo \`.phantom ${command}\` está em fase de construção.`);
        }

        // Se não for um comando fixo, processar através da IA
        try {
            await handleAICommand(message, userQuery);
        } catch (error) {
            console.error("Erro na execução da IA:", error);
            message.reply("❌ Ocorreu um erro ao processar a requisição de IA.");
        }
    }
};
