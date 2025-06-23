// commands/admin/admin.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Clan, HelpQuestion } = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin-only commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Shows a guide for all admin commands.')
        )
        .addSubcommandGroup(group => group.setName('clan').setDescription('Admin commands for clan management.')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Creates a new clan and assigns an owner.')
                .addUserOption(option => option.setName('owner').setDescription('The user to be the clan owner.').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('The name of the new clan.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('The existing Discord role for this clan.').setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('change_owner')
                .setDescription('Changes the owner of an existing clan.')
                .addRoleOption(option => option.setName('clan_role').setDescription('The role of the clan to modify.').setRequired(true))
                .addUserOption(option => option.setName('new_owner').setDescription('The new owner of the clan.').setRequired(true)))
        )
        .addSubcommandGroup(group => group.setName('guide').setDescription('Admin commands for the help guide.')
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Adds a new question to the help guide.')
                .addStringOption(option => option.setName('name').setDescription('The unique name for this entry (for the dropdown).').setRequired(true))
                .addStringOption(option => option.setName('message_id').setDescription('The ID of the message to use as the answer.').setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Removes a question from the help guide.')
                .addStringOption(option => option.setName('name').setDescription('The unique name of the entry to remove.').setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('edit')
                .setDescription('Edits an existing help question.')
                .addStringOption(option => option.setName('name').setDescription('The unique name of the entry to edit.').setRequired(true))
                .addStringOption(option => option.setName('new_message_id').setDescription('The ID of the new message to use as the answer.').setRequired(true)))
        ),

    async execute(interaction) {
        if (!interaction.client.config.admins.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ flags: 64 });

        try {
            // --- HELP COMMAND (No group) ---
            if (!group && subcommand === 'help') {
                const embed = new EmbedBuilder()
                    .setColor('#B22222')
                    .setTitle('Admin Command Guide')
                    .setDescription('Here are all available admin commands.')
                    .addFields(
                        { name: '/admin clan create', value: 'Creates a new clan, assigning an owner and role.' },
                        { name: '/admin clan change_owner', value: 'Transfers clan ownership to a new user.' },
                        { name: '/admin guide add', value: 'Adds a new topic to the help guide using a message ID.' },
                        { name: '/admin guide remove', value: 'Removes a topic from the help guide by its name.' },
                        { name: '/admin guide edit', value: 'Updates a help guide topic with a new message ID.' }
                    );
                return interaction.editReply({ embeds: [embed] });
            }

            // --- CLAN COMMANDS ---
            if (group === 'clan') {
                if (subcommand === 'create') {
                    const owner = interaction.options.getUser('owner');
                    const name = interaction.options.getString('name');
                    const role = interaction.options.getRole('role');
                    const existingName = await Clan.findOne({ where: { name: name } });
                    if (existingName) return interaction.editReply(`A clan with the name "${name}" already exists.`);
                    const existingRole = await Clan.findOne({ where: { roleId: role.id } });
                    if (existingRole) return interaction.editReply(`The role ${role.name} is already assigned to another clan.`);
                    await Clan.create({ name, roleId: role.id, ownerId: owner.id });
                    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('👑 Official Clan Owner Designated 👑').setDescription(`${owner} has been designated as the official Clan Owner of **${name}**!`).addFields({ name: 'Corresponding Role', value: `${role}` }).setTimestamp();
                    await interaction.channel.send({ content: `${owner}`, embeds: [embed] });
                    return interaction.editReply('Clan successfully created.');
                }
                if (subcommand === 'change_owner') {
                    const clanRole = interaction.options.getRole('clan_role');
                    const newOwner = interaction.options.getUser('new_owner');
                    const clan = await Clan.findOne({ where: { roleId: clanRole.id } });
                    if (!clan) return interaction.editReply(`No clan is associated with the role ${clanRole}.`);
                    const oldOwnerId = clan.ownerId;
                    clan.ownerId = newOwner.id;
                    await clan.save();
                    const embed = new EmbedBuilder().setColor('#FFFF00').setTitle('👑 Clan Ownership Transferred 👑').setDescription(`Ownership of **${clan.name}** has been transferred to ${newOwner}.`).addFields({ name: 'Previous Owner', value: `<@${oldOwnerId}>` }, { name: 'New Owner', value: `${newOwner}` }).setTimestamp();
                    await interaction.channel.send({ embeds: [embed] });
                    return interaction.editReply('Clan ownership successfully transferred.');
                }
            }

            // --- GUIDE COMMANDS ---
            if (group === 'guide') {
                const name = interaction.options.getString('name');
                if (subcommand === 'add' || subcommand === 'edit') {
                    const messageId = interaction.options.getString(subcommand === 'add' ? 'message_id' : 'new_message_id');
                    let fetchedMessage;
                    try {
                        fetchedMessage = await interaction.channel.messages.fetch(messageId);
                    } catch { return interaction.editReply('Could not find a message with that ID in this channel.'); }
                    if (subcommand === 'add') {
                        const count = await HelpQuestion.count();
                        if (count >= 25) return interaction.editReply('Cannot add question. The maximum limit of 25 has been reached.');
                    }
                    const answerData = { content: fetchedMessage.content || " ", embeds: fetchedMessage.embeds.map(embed => embed.toJSON()) };
                    await HelpQuestion.upsert({ name, answerData });
                    return interaction.editReply(`Successfully ${subcommand}ed the help entry named "**${name}**".`);
                }
                if (subcommand === 'remove') {
                    const rowCount = await HelpQuestion.destroy({ where: { name } });
                    if (rowCount === 0) return interaction.editReply(`No help entry named "**${name}**" found.`);
                    return interaction.editReply(`Successfully removed the help entry named "**${name}**".`);
                }
            }
        } catch (error) {
            console.error(`Error executing /admin command:`, error);
            return interaction.editReply('An unexpected error occurred while processing your command.');
        }
    },
};