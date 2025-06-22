// commands/utility/help.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { HelpQuestion } = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the help dashboard.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('dashboard')
                .setDescription('Shows a list of available help topics.')
        ),

    async execute(interaction) {
        const questions = await HelpQuestion.findAll({
            order: [['name', 'ASC']],
            limit: 25
        });

        if (questions.length === 0) {
            return interaction.reply({ content: 'There are currently no topics in the help guide.', flags: 64 });
        }

        const options = questions.map(q => ({
            label: q.name,
            description: `View the help entry for "${q.name}".`,
            value: q.name,
        }));

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_guide_select')
                    .setPlaceholder('Select a topic to view...')
                    .addOptions(options),
            );

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Help Guide')
            .setDescription('Please select a topic from the dropdown menu below to get more information.');

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    },
};