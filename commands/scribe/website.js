const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder().setName('website').setDescription('Replies with the link to the transcript website!'),
	async execute(interaction) {
		await interaction.reply('https://www.mousedev.dev/transcripts');
	},
};