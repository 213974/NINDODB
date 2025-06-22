// commands/utility/timestamp.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chrono = require('chrono-node');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timestamp')
        .setDescription('Generates a dynamic Discord timestamp from text.')
        .addStringOption(option =>
            option.setName('datetime')
                .setDescription("The date and time (e.g., 'tomorrow at 4pm', 'March 20th 17:30', 'in 2 hours')")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('format')
                .setDescription('The display format for the timestamp.')
                .setRequired(false)
                .addChoices(
                    { name: 'Short Date/Time (e.g., November 20, 2024 4:30 PM)', value: 'f' },
                    { name: 'Long Date/Time (e.g., Wednesday, November 20, 2024 4:30 PM)', value: 'F' },
                    { name: 'Short Date (e.g., 11/20/2024)', value: 'd' },
                    { name: 'Long Date (e.g., November 20, 2024)', value: 'D' },
                    { name: 'Short Time (e.g., 4:30 PM)', value: 't' },
                    { name: 'Long Time (e.g., 4:30:00 PM)', value: 'T' },
                    { name: 'Relative Time (e.g., in 2 months)', value: 'R' }
                )),
    async execute(interaction) {
        const dateTimeStr = interaction.options.getString('datetime');
        const formatStyle = interaction.options.getString('format') ?? 'F'; // Default to Long Date/Time

        try {
            const parsedResult = chrono.parse(dateTimeStr);

            if (parsedResult.length === 0) {
                return interaction.reply({
                    content: "I couldn't understand that date and time. Please try a clearer format like `March 20 5pm` or `in 30 minutes`.",
                    flags: 64
                });
            }

            const parsedDate = parsedResult[0].start.date();
            const unixTimestamp = Math.floor(parsedDate.getTime() / 1000);

            const allFormats = [
                `Short Time: \`<t:${unixTimestamp}:t>\``,
                `Long Time: \`<t:${unixTimestamp}:T>\``,
                `Short Date: \`<t:${unixTimestamp}:d>\``,
                `Long Date: \`<t:${unixTimestamp}:D>\``,
                `Short Date/Time: \`<t:${unixTimestamp}:f>\``,
                `Long Date/Time: \`<t:${unixTimestamp}:F>\``,
                `Relative: \`<t:${unixTimestamp}:R>\``,
            ].join('\n');

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('Discord Timestamp Generated')
                .setDescription(`Your selected timestamp format results in: **<t:${unixTimestamp}:${formatStyle}>**`)
                .addFields(
                    { name: 'Preview', value: `This will look like: ${new Date(unixTimestamp * 1000).toLocaleString()}` },
                    { name: 'All Formats (Copyable)', value: allFormats }
                )
                .setFooter({ text: 'This timestamp will appear correctly for everyone in their local time.' });

            await interaction.reply({ embeds: [embed], flags: 64 });

        } catch (error) {
            console.error('[TimestampCommand] Error:', error);
            await interaction.reply({ content: 'An error occurred while parsing the date. Please check your input.', flags: 64 });
        }
    },
};