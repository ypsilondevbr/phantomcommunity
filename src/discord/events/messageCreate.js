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
                    { name: '🧹 Moderação Extra', value: '`.phantom unban <ID>` - Desbane\n`.phantom untimeout <@>` - Tira castigo\n`.phantom lock` - Tranca canal\n`.phantom unlock` - Destranca canal\n`.phantom slowmode <s/m/h>` - Modo lento\n`.phantom clear <1-100>` - Apaga mensagens\n`.phantom nuke` - Recria o canal apagando tudo\n`.phantom mute <@>` - Muta microfone\n`.phantom unmute <@>` - Desmuta\n`.phantom deafen <@>` - Ensurdece\n`.phantom undeafen <@>` - Desensurdece\n`.phantom addrole <@> <@cargo>` - Dá cargo\n`.phantom removerole <@> <@cargo>` - Tira cargo\n`.phantom lockdown` - Tranca servidor todo\n`.phantom unlockdown` - Destranca tudo' },
                    { name: 'ℹ️ Informação & Utils', value: '`.phantom serverinfo` - Infos do Server\n`.phantom botinfo` - Infos do Bot\n`.phantom avatar <@>` - Vê a foto\n`.phantom ping` - Latência\n`.phantom uptime` - Tempo online\n`.phantom roles` - Conta cargos\n`.phantom emojis` - Conta emojis\n`.phantom invite` - Gera link\n`.phantom math <conta>` - Faz cálculos\n`.phantom nick <@> <nome>` - Muda apelido\n`.phantom setafk` - Seta call AFK\n`.phantom say <texto>` - Bot fala\n`.phantom embed <texto>` - Envia Embed\n`.phantom poll <texto>` - Cria votação\n`.phantom giveaway <premio>` - Sorteio\n`.phantom move <@> <#call>` - Move na call\n`.phantom disconnect <@>` - Derruba da call' },
                    { name: '🎭 Ações Sociais (GIFs)', value: '`.phantom slap <@>` - Dá um tapa\n`.phantom hug <@>` - Abraça\n`.phantom kiss <@>` - Beija\n`.phantom punch <@>` - Soca\n`.phantom pat <@>` - Carinho\n`.phantom kill <@>` - Finaliza\n`.phantom bite <@>` - Morde\n`.phantom tickle <@>` - Cócegas\n`.phantom poke <@>` - Cutuca\n`.phantom highfive <@>` - Bate mãos\n`.phantom stare <@>` - Encara\n`.phantom cuddle <@>` - Aconchega\n`.phantom feed <@>` - Dá comida\n`.phantom wave` - Acena\n`.phantom dance` - Dança\n`.phantom cry` - Chora\n`.phantom laugh` - Ri\n`.phantom blush` - Corado\n`.phantom smug` - Sorriso convencido\n`.phantom pout` - Bico\n`.phantom confused` - Confuso\n`.phantom angry` - Bravo\n`.phantom happy` - Feliz\n`.phantom sad` - Triste\n`.phantom shocked` - Chocado\n`.phantom sleep` - Dorme\n`.phantom bored` - Tédio\n`.phantom wink` - Pisca' },
                    { name: '🎮 Minigames & Zueira', value: '`.phantom 8ball <txt>` - Bola mágica\n`.phantom coinflip` - Cara/Coroa\n`.phantom roll` - Rola dado\n`.phantom joke` - Conta piada\n`.phantom dadjoke` - Piada de tiozão\n`.phantom fact` - Fato curioso\n`.phantom quote` - Frase inspiradora\n`.phantom compliment <@>` - Elogia\n`.phantom insult <@>` - Insulta\n`.phantom rate <@>` - Dá nota (0-10)\n`.phantom pp <@>` - Mede p*\n`.phantom gayrate <@>` - % Viadagem\n`.phantom simprate <@>` - % Gado\n`.phantom iq <@>` - Mede QI\n`.phantom marry <@>` - Pede em casamento\n`.phantom divorce <@>` - Pede divórcio\n`.phantom ship <@>` - Combinação do Casal\n`.phantom hack <@>` - Hackeia o alvo\n`.phantom reverse <txt>` - Inverte texto\n`.phantom mock <txt>` - tExTo\n`.phantom uwu <txt>` - uWu\n`.phantom rps <txt>` - Pedra, papel, tesoura\n`.phantom meme` - Meme' },
                    { name: '🛡️ Comandos Bases (Core)', value: '`.phantom ban <@>` - Banir\n`.phantom kick <@>` - Expulsar\n`.phantom timeout <@>` - Castigar\n`.phantom warn <@>` - Advertir\n`.phantom history <@>` - Histórico de bans\n`.phantom userinfo <@>` - Ficha do usuário\n`.phantom role create/delete` - Manipula cargo\n`.phantom channel create/delete` - Manipula canal\n`.phantom status` - Status do Bot\n`.phantom debug` - Debug da API Key' }
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

        // Comandos Fixos
        if (command === 'status') {
            return message.reply("✅ Status: Operacional\n🧠 IA: Google Gemini 2.5 Pro\n🗄️ Database: SQLite Online");
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

        // Executa comandos clássicos do Bundle
        const extraCommands = require('../commands/bundle');
        if (extraCommands[command]) {
            return extraCommands[command](message, args);
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
