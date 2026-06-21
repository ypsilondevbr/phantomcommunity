module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[Discord] Bot logado como ${client.user.tag}`);
        // 3 = WATCHING
        client.user.setActivity('.phantomhelp | Inteligência Artificial', { type: 3 });
    }
};
