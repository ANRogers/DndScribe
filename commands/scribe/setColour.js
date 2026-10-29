const { SlashCommandBuilder } = require('discord.js');
const { setColour } = require('../../characterStore');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('set-colour')
		.setDescription('Assigns entered colour to user')
		.addStringOption((option) =>
			option.setName('colour').setDescription('Enter your character colour in form: #ffffff').setRequired(true),
		),
	async execute(interaction) {
		const charColour = interaction.options.getString('colour', true);
        if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(charColour)) {
            return interaction.reply({ content: '**Error**: Not valid colour hexcode!', ephemeral: true });
        }
        const user = interaction.user.username;
		setColour(interaction.user.id, user, charColour);
		await interaction.reply(`**${charColour}** assigned to ${user}!`);
	},
};