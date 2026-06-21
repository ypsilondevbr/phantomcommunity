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
            return message.reply("🤖 **PHANTOM COMMUNITY AI**\nCentral de Ajuda:\n\nUse `.phantom [pedido]` para IA.\n\n🛡️ **Comandos Fixos:**\n`.phantom ban @usuario motivo`\n`.phantom kick @usuario motivo`\n`.phantom timeout @usuario tempo`\n`.phantom warn @usuario motivo`\n`.phantom userinfo @usuario`");
        }

        const prefix = '.phantom';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        const userQuery = message.content.slice(prefix.length).trim();

        if (userQuery.length === 0 && !command) {
            return message.reply("Como posso ajudar? Digite `.phantomhelp` para ver as opções ou me peça o que quiser.");
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

        // TODO: Outros comandos fixos como role, channel, setup, tickets, etc.
        const pendingCommands = ['role', 'channel', 'category', 'setup', 'tickets', 'welcome', 'logs', 'backup', 'security', 'lockdown'];
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
