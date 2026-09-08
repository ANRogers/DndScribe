const fs = require('node:fs');
const path = require('node:path');

const sessions = new Map(); // guildId -> { connection, entries, filePath }
const SESSIONS_DIR = path.join(__dirname, 'sessions');

const { EventEmitter } = require('node:events');
const sessionEvents = new EventEmitter();

function startSession(guildId, connection, sessionNumber = null) {
	if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

	const fileName = sessionNumber
		? `session-${sessionNumber}.txt`
		: `session-${Date.now()}.txt`;

	const filePath = path.join(SESSIONS_DIR, fileName);
	fs.writeFileSync(filePath, '');

	sessions.set(guildId, { connection, entries: [], filePath });
}

function getSession(guildId) {
	return sessions.get(guildId);
}

function addEntry(guildId, speaker, text, date) {
	const session = sessions.get(guildId);
	if (!session) return;

	const entry = { timestamp: date, speaker, text };
	const line = `[${entry.timestamp.toLocaleTimeString()}] ${speaker}: ${text}\n`;

	session.entries.push(entry);
	fs.appendFileSync(session.filePath, line);

	sessionEvents.emit('newEntry', { guildId, entry }); // new: announce it
}

function endSession(guildId) {
	sessions.delete(guildId);
}

function getEntries(guildId) {
	const session = sessions.get(guildId);
	return session ? session.entries : [];
}



module.exports = { startSession, getSession, addEntry, endSession, getEntries, sessionEvents };