const { SlashCommandBuilder } = require('discord.js');
const { getSession, resumeSession } = require('../../sessionManager');
const { ownerId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scribe-resume')
		.setDescription('Resumes transcription after a pause'),
	async execute(interaction) {

		const session = getSession(interaction.guildId);
		if (!session) {
			return interaction.reply({ content: 'No active session to resume.', ephemeral: true });
		}

		resumeSession(interaction.guildId);
		await interaction.reply('Scribing resumed.');
	},
};