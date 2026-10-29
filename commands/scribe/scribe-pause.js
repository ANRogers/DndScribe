const { SlashCommandBuilder } = require('discord.js');
const { getSession, pauseSession } = require('../../sessionManager');
const { ownerId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scribe-pause')
		.setDescription('Pauses transcription without ending the session'),
	async execute(interaction) {


		const session = getSession(interaction.guildId);
		if (!session) {
			return interaction.reply({ content: 'No active session to pause.', ephemeral: true });
		}

		pauseSession(interaction.guildId);
		await interaction.reply('Scribing paused. The bot stays connected — use `/scribe-resume` to continue.');
	},
};