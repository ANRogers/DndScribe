
const { Events, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,

    async execute(guild) {
        // Find a suitable text channel to send the welcome message
        const channel = guild.channels.cache.find(
            channel =>
                channel.type === ChannelType.GuildText &&
                channel.permissionsFor(guild.members.me).has([
                    'ViewChannel',
                    'SendMessages',
                    'EmbedLinks'
                ])
        );

        // If no suitable channel exists, do nothing
        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x7C5CFC)
            .setTitle('Welcome to D&D Scribe!')
            .setDescription(
                'Thanks for adding D&D Scribe to your server.\n\n' +
                'D&D Scribe helps you record your Dungeons & Dragons sessions, ' +
                'generate transcripts and summaries, and organise your campaign notes.'
            )
            .addFields(
                {
                    name: 'Getting Started',
                    value:
                        '`/set-character` Set your character name.\n' +
                        '`/scribe-start` Start recording a session.\n' +
                        '`/scribe-pause` Pause transcription.\n' +
                        '`/scribe-resume` Resume transcription.\n' +
                        '`/scribe-end` Finish your session and retrieve the transcript.\n' +
                        '`/summarise` Generate a summary from a transcript.'
                },
                {
                    name: 'Need Help?',
                    value:
                        'Run `/scribe-help` to view the full command guide.'
                }
            )
            .setFooter({
                text: 'D&D Scribe | Your adventures, organised.'
            })
            .setTimestamp();

        try {
            await channel.send({ embeds: [welcomeEmbed] });
        } catch (error) {
            console.error(
                `Failed to send welcome message in ${guild.name}:`,
                error
            );
        }
    },
};
