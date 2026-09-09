const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { startSession, addEntry } = require('../../sessionManager');
const { setupVoiceCapture } = require('../../transcribe/voiceCapture');
const { transcribeAudio } = require('../../transcribe/transcriber');
const fs = require('node:fs');
const { getCharacter } = require('../../characterStore');
const { ownerId } = require('../../config.json');
const path = require('node:path');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('scribe-start')
		.setDescription('DND scribe will join your chat and begin scribeing')
		.addIntegerOption((option) =>
			option.setName('session').setDescription('Session number (optional)').setRequired(false),
		),
	async execute(interaction) {
		if (interaction.user.id != ownerId) {
			return interaction.reply({ content: 'You Do Not Have Permission To Use This Command!', ephemeral: true });
		}
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			return interaction.reply({
				content: 'You need to be in a voice channel first!',
				ephemeral: true,
			});
		}

		const sessionNumber = interaction.options.getInteger('session'); // null if not provided
		const sessionsPath = path.join(global.projectRoot, `sessions ${sessionNumber}.txt`);

		if (fs.existsSync(sessionsPath)) {
			return interaction.reply({ content: `Session ${sessionNumber}, already exsits!`, ephemeral: true });
		}


		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
			selfDeaf: false,
		});

		startSession(interaction.guildId, connection, sessionNumber);

		setupVoiceCapture(connection, async (userId, wavPath) => {
			const date = new Date();
			const text = await transcribeAudio(wavPath);
			fs.unlink(wavPath, () => {});

			if (!text) return;

			const character = getCharacter(userId);
			let displayName = character;

			if (!displayName) {
				try {
					const member = await interaction.guild.members.fetch(userId);
					displayName = member.displayName;
				} catch {
					displayName = userId;
				}
			}

			addEntry(interaction.guildId, displayName, text, date);
			console.log(`[${displayName}] ${text}`);
		});

		const sessionLabel = sessionNumber ? ` (Session ${sessionNumber})` : '';
		await interaction.reply(`Joined ${voiceChannel.name} and started scribeing!${sessionLabel}`);
	},
};