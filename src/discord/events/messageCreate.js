const { handleAICommand } = require('../../ai/agent');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;

        // Suporte tanto a `.phantom` quanto `.phantomhelp`
        if (message.content === '.phantomhelp') {
            return message.reply("🤖 **PHANTOM COMMUNITY AI**\nCentral de Ajuda:\n\nUse `.phantom [pedido]` para IA.\nUse `.phantom ban`, `.phantom kick` para comandos rápidos.");
        }

        const prefix = '.phantom';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        const userQuery = message.content.slice(prefix.length).trim();

        if (userQuery.length === 0) {
            return message.reply("Como posso ajudar? Digite `.phantomhelp` para ver as opções ou me peça o que quiser.");
        }

        // Roteador Híbrido
        if (command === 'status') {
            return message.reply("✅ Status: Operacional\n🧠 IA: OpenAI Conectada\n🗄️ Database: SQLite Online");
        }

        // TODO: Expandir para carregar os comandos da pasta 'commands'
        if (['ban', 'kick', 'timeout', 'warn', 'setup'].includes(command)) {
            return message.reply(`[Comando Fixo] Executando rotina administrativa para: ${command}`);
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
