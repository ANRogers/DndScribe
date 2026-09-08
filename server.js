const express = require('express');
const http = require('node:http'); // new
const { Server } = require('socket.io'); // new
const path = require('node:path');
const { guildId } = require('./config.json');
const { getEntries, sessionEvents } = require('./sessionManager'); // add sessionEvents

const app = express();
const httpServer = http.createServer(app); // wrap express in a raw http server
const io = new Server(httpServer); // attach socket.io to that server
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/transcript', (req, res) => {
	res.json(getEntries(guildId));
});

// Whenever sessionManager announces a new line, push it to every connected browser
sessionEvents.on('newEntry', ({ guildId: eventGuildId, entry }) => {
	if (eventGuildId !== guildId) return; // ignore other servers' sessions
	io.emit('newEntry', entry);
});

function startWebServer() {
	httpServer.listen(PORT, () => { // listen on httpServer now, not app
		console.log(`Transcript viewer running at http://localhost:${PORT}`);
	});
}

module.exports = { startWebServer };