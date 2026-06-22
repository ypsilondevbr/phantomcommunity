const Database = require('better-sqlite3');
const path = require('path');

let db;

function initDatabase() {
    const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
    db = new Database(dbPath, { verbose: console.log });

    console.log("[DB] Conectado ao banco de dados SQLite.");

    // Criar tabelas necessárias para o bot híbrido multi-server
    
    // Tabela: servers (Configurações e preferências por guild)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS servers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT UNIQUE NOT NULL,
            owner_id TEXT,
            settings TEXT, -- JSON armazenando preferências da IA, logs, canais, etc
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela: ai_logs (Auditoria de Decisões da IA)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ai_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            request TEXT NOT NULL,
            plan TEXT,
            tools_used TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela: ai_memory (Memória de longo prazo da IA por servidor)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ai_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            context_key TEXT NOT NULL,
            context_value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guild_id, context_key)
        )
    `).run();

    // Tabela: server_logs (Logs normais de administração)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS server_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            action TEXT NOT NULL,
            user_id TEXT NOT NULL,
            target_id TEXT,
            reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela: users (Sistema de Pontos dos Minigames)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            points INTEGER DEFAULT 0
        )
    `).run();

    console.log("[DB] Tabelas verificadas e criadas com sucesso.");
}

function getDB() {
    if (!db) {
        throw new Error("Banco de dados não inicializado.");
    }
    return db;
}

function addPoints(userId, amount) {
    if (!db) return;
    try {
        db.prepare(`INSERT INTO users (user_id, points) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET points = points + ?`).run(userId, amount, amount);
    } catch(e) { console.error("Erro ao adicionar pontos:", e); }
}

function removePoints(userId, amount) {
    if (!db) return;
    try {
        db.prepare(`INSERT INTO users (user_id, points) VALUES (?, 0) ON CONFLICT(user_id) DO UPDATE SET points = MAX(0, points - ?)`).run(userId, amount);
    } catch(e) { console.error("Erro ao remover pontos:", e); }
}

function getTopPlayers(limit = 10) {
    if (!db) return [];
    try {
        return db.prepare(`SELECT user_id, points FROM users ORDER BY points DESC LIMIT ?`).all(limit);
    } catch(e) { 
        console.error("Erro ao buscar top players:", e); 
        return []; 
    }
}

function getUserPoints(userId) {
    if (!db) return 0;
    try {
        const row = db.prepare(`SELECT points FROM users WHERE user_id = ?`).get(userId);
        return row ? row.points : 0;
    } catch(e) { return 0; }
}

module.exports = {
    initDatabase,
    getDB,
    addPoints,
    removePoints,
    getTopPlayers,
    getUserPoints
};
