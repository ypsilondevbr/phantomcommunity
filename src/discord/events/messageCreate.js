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

        // Central de Ajuda
        if (message.content === '.phantomhelp') {
            const { EmbedBuilder } = require('discord.js');
            const helpEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🤖 Central de Ajuda - Phantom Community')
                .setDescription('O Phantom opera de forma híbrida: você pode usar comandos fixos e rápidos, ou pedir o que quiser para a Inteligência Artificial enviando `.phantom <seu pedido>`.')
                .addFields(
                    { name: '🧠 Inteligência Artificial', value: '`.phantom crie uma categoria chamada VIPs e dois canais dentro dela`\n`.phantom apague as mensagens deste canal`\n*(A IA entende linguagem natural e toma as ações por você)*' },
                    { name: '🛡️ Moderação', value: '`.phantom ban @usuario [motivo]`\n`.phantom kick @usuario [motivo]`\n`.phantom timeout @usuario <10m/1h/1d> [motivo]`\n`.phantom warn @usuario <motivo>`\n`.phantom history @usuario` *(Vê histórico de punições)*' },
                    { name: '⚙️ Gerenciamento', value: '`.phantom role create <nome>`\n`.phantom role delete @cargo`\n`.phantom channel create <nome>`\n`.phantom channel edit #canal <novo_nome>`' },
                    { name: 'ℹ️ Informações', value: '`.phantom userinfo @usuario`\n`.phantom status`' }
                )
                .setFooter({ text: 'Desenvolvido para Phantom Community' })
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
