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
	const charInfo = store[userId];

	let charColour;
	// check if a colour has been already assined if not set a default
	if (charInfo) {
		charColour = charInfo[1];
	}
	else {
		const colours = ['#4fd1c5', '#f2b880', '#c792ea', '#82aaff', '#f07178', '#a3e07f'];
		charColour = colours[Math.floor(Math.random() * colours.length)];
	}
	store[userId] = [characterName, charColour];
	saveStore(store);
}

function setColour(userId, charName, colourName) {
	const store = loadStore();
	const charInfo = store[userId];
	
	let characterName;
	// check if a name has been already assined if not set a username
	if (charInfo) {
		characterName = charInfo[0];
	}
	else {
		characterName = charName;
	}
	store[userId] = [characterName, colourName];
	saveStore(store);
}

function getCharacter(userId) {
	const store = loadStore();
	const entry = store[userId];
	return entry ? entry[0] : null;
}

function getCharacterColour(userId) {
	const store = loadStore();
	const charInfo = store[userId];
	return charInfo ? charInfo[1] : null;
}

function getAllCharacterNames() {
	return Object.values(loadStore()).map((entry) => entry[0]);
}

module.exports = { setCharacter, setColour, getCharacter, getCharacterColour, getAllCharacterNames };