const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder().setName('website').setDescription('Replies with the link to the transcript website!'),
	async execute(interaction) {
		await interaction.reply('http://10.241.185.129:3000');
	},
};