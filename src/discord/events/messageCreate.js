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
                .setTitle('🤖 Painel de Controle - Phantom AI')
                .setDescription('A IA do Phantom é onipotente. Não decore comandos, apenas **peça em linguagem natural** usando `.phantom <pedido>`. Ela possui **51 Ferramentas Nativas** para controlar o servidor.')
                .addFields(
                    { name: '🎙️ Controle de Calls e Voz', value: 'Puxe membros, mute, ensurdeça, crie canais de Palco (Stage), derrube pessoas ou crie calls novas.\n*Ex: `.phantom crie uma call chamada Bate Papo e puxe o @fulano pra lá`*' },
                    { name: '🧹 Nuke e Moderação Absoluta', value: 'Clone canais inteiros, apague centenas de mensagens, puna usuários, ative o Modo Lento, ou desbane todo mundo de uma vez.\n*Ex: `.phantom clone este canal e apague o antigo`*' },
                    { name: '🏛️ Arquitetura do Servidor', value: 'Crie e renomeie categorias, mova canais, crie Threads (Tópicos), tranque canais e configure o canal AFK ou de Regras.\n*Ex: `.phantom crie uma categoria VIP e mova a call de suporte pra lá`*' },
                    { name: '🎭 Identidade e Cargos', value: 'Crie cargos administrativos, distribua tags, mude apelidos, crie Emojis, ou renomeie o servidor.\n*Ex: `.phantom me faça um cargo vermelho chamado Dono Supremo`*' },
                    { name: '📢 Utilidades', value: 'Faça sorteios, fixe mensagens, gere convites, envie DMs secretas ou solte Embeds super avançados.\n*Ex: `.phantom crie um sorteio de um Pix de 100 reais aqui`*' },
                    { name: '⚡ Comandos Clássicos (Pré-Prontos)', value: 'O bot também tem funções manuais rápidas (sem usar a IA):\n`.phantom ban @user` | `.phantom kick @user`\n`.phantom timeout @user <tempo>` | `.phantom warn @user`\n`.phantom history @user` | `.phantom userinfo @user`\n`.phantom role create/delete` | `.phantom channel create/edit`' }
                )
                .setImage('https://i.imgur.com/rN5G5f8.gif') // Aesthetic banner (optional but cool)
                .setFooter({ text: 'Phantom Ultimate Suite - 51 Módulos Ativos' })
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
