require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const { initDatabase } = require('./database/db');
const fs = require('fs');
const path = require('path');

// 1. Iniciar servidor Express (Fake HTTP Server para Railway 24/7)
const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).send('Bot está rodando e saudável!');
});

app.listen(port, () => {
    console.log(`[Express] Servidor rodando na porta ${port}`);
});

// 2. Inicializar o Banco de Dados (SQLite)
initDatabase();

// 3. Configurar e Iniciar o Client do Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Collections
client.commands = new Collection();
client.cooldowns = new Collection();

// 4. Carregar Eventos (messageCreate, interactionCreate, ready)
const eventsPath = path.join(__dirname, 'discord', 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
} else {
    console.warn("[Aviso] Pasta de eventos não encontrada ainda.");
}

// 5. Autenticação no Discord
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("[Erro Fatal] Falha ao conectar ao Discord:", err);
});
