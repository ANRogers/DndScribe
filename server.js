
const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('node:path');

const {
    getEntries,
    sessionEvents,
    getActiveGuildIds
} = require('./sessionManager');

const app = express();
const httpServer = http.createServer(app);

const PORT = 3000;
let client;

// Allowed website origins
const allowedOrigins = [
    'https://mousedev.dev',
    'https://www.mousedev.dev',
];

// Configure CORS
app.use(cors({
    origin: allowedOrigins
}));

// Configure Express
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

// Get transcript history for a server
app.get('/api/transcript/:guildId', (req, res) => {
    res.json(getEntries(req.params.guildId));
});

// Get available Discord servers
app.get('/api/guilds', (req, res) => {
    const guilds = getActiveGuildIds().map(guildId => {
        const guild = client.guilds.cache.get(guildId);

        return {
            id: guildId,
            name: guild ? guild.name : 'Unknown Server'
        };
    });

    res.json(guilds);
});

// Broadcast new transcript entries
sessionEvents.on('newEntry', ({ guildId, entry }) => {
    io.emit('newEntry', { guildId, entry });
});

// Start the web server
function startWebServer(discordClient) {
    client = discordClient;

    httpServer.listen(PORT, () => {
        console.log(`Transcript viewer running at http://localhost:${PORT}`);
    });
}

module.exports = { startWebServer };
