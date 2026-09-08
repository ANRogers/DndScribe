const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { summeriseAi } = require('../../AI_Summerise');


module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder().setName('summarize').setDescription('Summarize session notes and send them to obsidian!')
    .addStringOption((option) => option.setName('session-file').setDescription('Enter Session File.').setRequired(true)),
	async execute(interaction) {
		const sessionFile = interaction.options.getString('session-file', true).toLowerCase();
		const sessionsPath = path.join(global.projectRoot, 'sessions');
        const sessionsFileFull = path.join(sessionsPath, sessionFile);

        if (!fs.existsSync(sessionsFileFull)) {
            return interaction.reply({ content: `There is no file of that name found ${sessionsFileFull}`, ephemeral: true });
        }
        await interaction.deferReply();
        try {
            const prompt = fs.readFileSync(sessionsFileFull, 'utf8');
            const resultMessage = await summeriseAi(prompt, sessionFile);
            await interaction.editReply(resultMessage);
            // if (summeriseAi(prompt, sessionFile)) {
            //     return interaction.editReply(`File \`${sessionFile}\` was summerised!`);
            // }
            // return interaction.editReply({ content: `File \`${sessionFile}\` filed to be summerised!`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.editReply(
                `There was an error while summeriseing this file:\n\`${error.message}\``,
            );
        }
	},
};