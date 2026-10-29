const { SlashCommandBuilder } = require('discord.js');
const { setCharacter } = require('../../characterStore');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('set-character')
		.setDescription('Assigns entered character to user')
		.addStringOption((option) =>
			option.setName('character').setDescription('Enter your character name').setRequired(true),
		),
	async execute(interaction) {
		const charName = interaction.options.getString('character', true);
		setCharacter(interaction.user.id, charName);
		await interaction.reply(`**${charName}** assigned to ${interaction.user.username}!`);
	},
};