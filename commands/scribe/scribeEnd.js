const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { getSession, endSession } = require('../../sessionManager');
const { ownerId } = require('../../config.json');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('scribe-end')
		.setDescription('DND scribe will leave your chat and stop scribeing'),
	async execute(interaction) {
		const connection = getVoiceConnection(interaction.guildId);

		if (!connection) {
			return interaction.reply({ content: "I'm not in a voice channel.", ephemeral: true });
		}

		connection.destroy();

		const session = getSession(interaction.guildId);
		endSession(interaction.guildId);

		if (!session) {
			return interaction.reply('Left the voice channel.');
		}

		const transcriptFile = new AttachmentBuilder(session.filePath);

		await interaction.reply(
			{ content: `Left the voice channel. Transcript saved to \`${session.filePath}\`. Session file: `,
			files: [transcriptFile],
		});
	},
};