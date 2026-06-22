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
                .setDescription('Você pode pedir ações para a IA enviando `.phantom <seu pedido>`. A IA tentará mapear o seu texto para uma destas **51 funções nativas (comandos pré-prontos)**:')
                .addFields(
                    { name: '🧹 Moderação e Limpeza', value: '`limpar_mensagens`, `expulsar_membro`, `banir_membro`, `desbanir_membro`, `castigar_membro`, `tirar_castigo_membro`, `limpar_bans`, `limpar_canal_nuke`' },
                    { name: '🎙️ Controle de Voz e Calls', value: '`ensurdecer_membro`, `desensurdecer_membro`, `mutar_membro_call`, `desmutar_membro_call`, `mover_membro_call`, `derrubar_membro_call`' },
                    { name: '🏛️ Estrutura do Servidor', value: '`criar_canal_texto`, `criar_canal_voz`, `criar_canal_anuncio`, `criar_canal_palco`, `deletar_canal`, `clonar_canal`, `trancar_canal`, `destrancar_canal`, `modo_lento`, `editar_topico_canal`, `set_canal_afk`, `set_canal_regras`' },
                    { name: '📁 Categorias e Tópicos', value: '`criar_categoria`, `renomear_categoria`, `deletar_categoria`, `mover_canal_categoria`, `criar_topico_thread`, `deletar_topico_thread`, `trancar_topico_thread`, `destrancar_topico_thread`' },
                    { name: '🎭 Cargos e Identidade', value: '`criar_cargo_admin`, `criar_cargo`, `editar_cargo`, `deletar_cargo`, `dar_cargo_membro`, `tirar_cargo_membro`, `mudar_apelido`, `mudar_nome_servidor`, `criar_emoji`, `deletar_emoji`' },
                    { name: '📢 Comunicação e Utilidades', value: '`enviar_anuncio`, `enviar_mensagem_embed_avancado`, `criar_sorteio`, `enviar_dm`, `fixar_mensagem`, `desfixar_mensagem`, `criar_convite`' },
                    { name: '⚡ Comandos Manuais (Sem IA)', value: '`.phantom ban`, `.phantom kick`, `.phantom warn`, `.phantom timeout`, `.phantom userinfo`, `.phantom history`, `.phantom role create/delete`, `.phantom channel create/edit`' }
                )
                .setFooter({ text: 'Phantom Ultimate Suite - 51 Funções Traduzidas Ativas' })
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
