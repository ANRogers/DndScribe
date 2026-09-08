const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder().setName('fuck-you').setDescription('Replies with Fuck You to someone!'),
	async execute(interaction) {
		await interaction.reply('Fuck You Alex!');
	},
};