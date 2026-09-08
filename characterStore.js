const fs = require('node:fs');
const path = require('node:path');

const STORE_PATH = path.join(__dirname, 'characters.json');

function loadStore() {
	if (!fs.existsSync(STORE_PATH)) return {};
	return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function saveStore(store) {
	fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function setCharacter(userId, characterName) {
	const store = loadStore();
	store[userId] = characterName;
	saveStore(store);
}

function getCharacter(userId) {
	const store = loadStore();
	return store[userId] || null;
}

function getAllCharacterNames() {
    return Object.values(loadStore());
}

module.exports = { setCharacter, getCharacter, getAllCharacterNames };