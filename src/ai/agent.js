const { logAI } = require('../core/logger');

async function handleAICommand(message, userQuery) {
    const statusMsg = await message.reply("🧠 Analisando sua solicitação com o Google Gemini...");

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY_MISSING");
        }

        // Remove possíveis aspas e espaços
        const cleanKey = process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim();

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Bypass do SDK oficial: Fazer requisição manual via fetch para evitar o bug de chaves "AQ." com pontos
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${cleanKey}`;
        
        const payload = {
            systemInstruction: {
                parts: [{ text: "Você é o Phantom Community AI, um administrador autônomo de Discord. Você pode planejar estruturas e gerenciar o servidor. Seja direto e objetivo. Sempre estruture suas respostas de forma limpa." }]
            },
            contents: [
                { role: "user", parts: [{ text: userQuery }] }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Resposta vazia da API do Gemini.");
        }

        const replyContent = data.candidates[0].content.parts[0].text;

        // Registrar no AI Decision Log
        logAI(guildId, userId, userQuery, replyContent, "Nenhuma ferramenta acionada ainda", "SUCESSO");

        if (replyContent.length > 2000) {
            await statusMsg.edit("✅ O plano gerado é muito extenso e foi processado com sucesso, mas o Discord bloqueia textos acima de 2000 caracteres.");
        } else {
            await statusMsg.edit(replyContent);
        }
        
    } catch (error) {
        console.error("Gemini Error:", error);
        let errorMsg = `❌ Erro do Gemini:\n\`\`\`\n${error.message.substring(0, 1500)}\n\`\`\``;
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
