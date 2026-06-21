const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logAI } = require('../core/logger');

// Inicializa a IA na primeira requisição, evitando crashe se a KEY estiver ausente no boot
let genAI;

async function handleAICommand(message, userQuery) {
    const statusMsg = await message.reply("🧠 Analisando sua solicitação com o Google Gemini...");

    try {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY_MISSING");
            }
            // Remove possíveis aspas duplas, aspas simples e espaços vazios que a pessoa possa ter colado sem querer
            const cleanKey = process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim();
            genAI = new GoogleGenerativeAI(cleanKey);
        }

        const guildId = message.guild.id;
        const userId = message.author.id;
        
        // Usar gemini-1.5-pro para maior estabilidade e compatibilidade
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            systemInstruction: "Você é o Phantom Community AI, um administrador autônomo de Discord. Você pode planejar estruturas e gerenciar o servidor. Seja direto e objetivo. Sempre estruture suas respostas de forma limpa." 
        });

        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage(userQuery);
        const replyContent = result.response.text();

        // Registrar no AI Decision Log
        logAI(guildId, userId, userQuery, replyContent, "Nenhuma ferramenta acionada ainda", "SUCESSO");

        if (replyContent.length > 2000) {
            await statusMsg.edit("✅ O plano gerado é muito extenso e foi processado com sucesso, mas o Discord bloqueia textos acima de 2000 caracteres.");
        } else {
            await statusMsg.edit(replyContent);
        }
        
    } catch (error) {
        console.error("Gemini Error:", error);
        let errorMsg = "❌ Erro ao conectar com o cérebro IA do Gemini.";
        if (error.message === "GEMINI_API_KEY_MISSING") {
            errorMsg = "❌ A API Key do Gemini (GEMINI_API_KEY) não foi encontrada no arquivo .env.";
        }
        await statusMsg.edit(errorMsg);
        logAI(message.guild?.id || "unknown", message.author.id, userQuery, null, null, "ERRO");
    }
}

module.exports = {
    handleAICommand
};
