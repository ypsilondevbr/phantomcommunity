const { logAI } = require('../core/logger');
const { geminiTools, executeTool } = require('./tools');

async function handleAICommand(message, userQuery) {
    const statusMsg = await message.reply("🧠 Analisando sua solicitação com o Google Gemini...");

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY_MISSING");
        }

        const cleanKey = process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim();
        const guildId = message.guild.id;
        const userId = message.author.id;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`;
        
        const payload = {
            systemInstruction: {
                parts: [{ text: "Você é o Phantom Community AI, um administrador autônomo de Discord. Você tem permissões para executar ferramentas reais no servidor. Se o usuário pedir para você realizar alguma ação de moderação ou gerenciamento, acione a ferramenta correta em vez de apenas responder com texto." }]
            },
            contents: [
                { role: "user", parts: [{ text: userQuery }] }
            ],
            tools: geminiTools
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        const part = data.candidates[0].content.parts[0];

        // Se a IA decidiu chamar uma ferramenta
        if (part.functionCall) {
            const funcName = part.functionCall.name;
            const funcArgs = part.functionCall.args || {};
            
            await statusMsg.edit(`🛠️ A IA decidiu acionar a ferramenta: **${funcName}**... Executando...`);
            
            const resultMsg = await executeTool(funcName, funcArgs, message);
            
            logAI(guildId, userId, userQuery, `FunctionCall: ${funcName}`, `Acionou ferramenta ${funcName}`, "SUCESSO");
            return await statusMsg.edit(resultMsg);
        }

        // Se for resposta de texto normal
        const replyContent = part.text || "Nenhuma resposta de texto gerada.";

        logAI(guildId, userId, userQuery, replyContent, "Nenhuma ferramenta acionada ainda", "SUCESSO");

        if (replyContent.length > 2000) {
            await statusMsg.edit("✅ Resposta gerada com sucesso, mas o texto ultrapassa 2000 caracteres.");
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
