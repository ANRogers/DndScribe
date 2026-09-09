const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, pythonPath } = require('./config.json');
const { startWebServer } = require('./server');

global.projectRoot = __dirname;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();
client.cooldowns = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		command.filePath = filePath;
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

startWebServer();

// Start the persistent Whisper transcription server as a background process.
// This loads the model once, instead of reloading it on every single clip.
const pythonServer = spawn(pythonPath, [path.join(__dirname, '/transcribe/transcribe.py')]);

pythonServer.stdout.on('data', (data) => {
	console.log(`[whisper-server] ${data.toString().trim()}`);
});
pythonServer.stderr.on('data', (data) => {
	console.error(`[whisper-server] ${data.toString().trim()}`);
});

// Make sure the Python server shuts down cleanly when the bot does,
// rather than lingering as an orphaned background process.
process.on('exit', () => pythonServer.kill());
process.on('SIGINT', () => {
	pythonServer.kill();
	process.exit();
});

client.login(token);