const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { getSession, endSession } = require('../../sessionManager');
const { ownerId } = require('../../config.json');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('scribe-end')
		.setDescription('DND scribe will leave your chat and stop scribeing'),
	async execute(interaction) {
		if (interaction.user.id != ownerId) {
			return interaction.reply({ content: 'You Do Not Have Permission To Use This Command!', ephemeral: true });
		}
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

		await interaction.reply(`Left the voice channel. Transcript saved to \`${session.filePath}\`.`);
	},
};