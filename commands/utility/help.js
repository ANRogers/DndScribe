
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,

    data: new SlashCommandBuilder()
        .setName('scribe-help')
        .setDescription('Displays help and information about D&D Scribe'),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x7C5CFC)
            .setTitle('D&D Scribe | Help Guide')
            .setDescription(
                'Your personal assistant for recording and documenting your Dungeons & Dragons adventures.\n\n' +
                'D&D Scribe can record session audio, generate transcripts and summaries, ' +
                'and help turn your adventures into organised notes for your campaign.'
            )
            .addFields(
                {
                    name: '1. Set Your Character',
                    value:
                        '`/set-character`\n' +
                        'Set the character you are playing before starting your session. ' +
                        'This helps the bot associate your contributions with the correct character.'
                },
                {
                    name: '2. Start a Session',
                    value:
                        '`/scribe-start`\n' +
                        'Start recording your D&D session. The bot will join the relevant voice channel ' +
                        'and begin capturing audio for transcription.'
                },
                {
                    name: '3. Pause a Session',
                    value:
                        '`/scribe-pause`\n' +
                        'Temporarily pause the session transcript. Use this when taking a break, ' +
                        'discussing something outside the game, or when you do not want the conversation ' +
                        'included in the transcript. Your session remains active.'
                },
                {
                    name: '4. Resume a Session',
                    value:
                        '`/scribe-resume`\n' +
                        'Resume transcription after pausing. Use this when you are ready to continue ' +
                        'recording your D&D session. The bot will continue capturing the session transcript.'
                },
                {
                    name: '5. End a Session',
                    value:
                        '`/scribe-end`\n' +
                        'Stop the recording and retrieve your session transcript. ' +
                        'The bot will provide the raw transcript as a `.txt` file, along with its filename. ' +
                        'Keep this filename handy for generating a summary.'
                },
                {
                    name: '6. Summarise a Session',
                    value:
                        '`/summarise`\n' +
                        'Generate a summarised version of a recorded session using its transcript file.\n\n' +
                        '**Required input:** The exact transcript filename, including `.txt`.\n' +
                        '**Example:** `sessionfile.txt`\n\n' +
                        'The bot will return the summary as a downloadable `.txt` file.'
                },
                {
                    name: '7. Summarise for Obsidian',
                    value:
                        '`/summarise-obsidian`\n' +
                        'Process a session transcript and save the resulting summary to an Obsidian campaign vault.\n\n' +
                        '⚠️ **Not currently available for general use.** This command is configured to save files ' +
                        'to the developer\'s personal computer and Obsidian vault. Do not use it unless you have ' +
                        'been told that your own vault has been configured.'
                },
                {
                    name: 'Tips for the Best Results',
                    value:
                        '• Set your character before starting a session.\n' +
                        '• Check your microphone and audio permissions before recording.\n' +
                        '• Speak clearly and avoid talking over other players where possible.\n' +
                        '• Keep the transcript filename exactly as provided, including `.txt`.\n' +
                        '• Review transcripts and summaries for errors before using them in your campaign notes.'
                },
                {
                    name: 'Need Help?',
                    value:
                        'Run `/sribe-help` at any time to view this guide again.\n' +
                        'If a command is missing or fails, check your permissions and make sure you are ' +
                        'providing any required inputs.'
                }
            )
            .setFooter({
                text: 'D&D Scribe • Your adventures, organised.'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [helpEmbed],
            ephemeral: true
        });
    },
};
