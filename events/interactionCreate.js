// events/interactionCreate.js
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Clan, HelpQuestion } = require('../database/database.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- CHAT INPUT COMMAND HANDLER ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            // This logic handles both regular commands and admin subcommands
            if (!command) {
                const adminCommand = interaction.client.commands.get('admin');
                if (adminCommand && interaction.commandName === 'admin') {
                    try {
                        await adminCommand.execute(interaction);
                    } catch (error) {
                        console.error(`Error executing admin command:`, error);
                        // Handle error reply
                        const replyOptions = { content: 'There was an error while executing this admin command!', flags: 64 };
                        if (interaction.replied || interaction.deferred) await interaction.followUp(replyOptions);
                        else await interaction.reply(replyOptions);
                    }
                } else {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                }
                return;
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`, error);
                const replyOptions = { content: 'There was an error executing this command!', flags: 64 };
                if (interaction.replied || interaction.deferred) await interaction.followUp(replyOptions);
                else await interaction.reply(replyOptions);
            }
        }

        // --- STRING SELECT MENU HANDLER ---
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'help_guide_select') {
                await interaction.deferReply({ ephemeral: !interaction.client.config.admins.includes(interaction.user.id) });
                const selectedName = interaction.values[0];
                const question = await HelpQuestion.findByPk(selectedName);

                if (!question) {
                    return interaction.editReply({ content: 'This help topic could not be found. It may have been recently removed.', flags: 64 });
                }

                const answer = question.answerData;
                await interaction.editReply({
                    content: answer.content,
                    embeds: answer.embeds
                });
            }
        }

        // --- BUTTON HANDLER ---
        else if (interaction.isButton()) {
            const [handler, action, ...data] = interaction.customId.split('_');

            if (handler !== 'clan') return; // Only process clan-related buttons

            // -- Clan Invite Handler --
            if (action === 'invite') {
                const [decision, clanId, targetId] = data;

                if (interaction.user.id !== targetId) {
                    return interaction.reply({ content: "This invitation is not for you.", flags: 64 });
                }

                await interaction.deferUpdate();
                const disabledRow = ActionRowBuilder.from(interaction.message.components[0]);
                disabledRow.components.forEach(c => c.setDisabled(true));

                const clan = await Clan.findByPk(clanId);
                if (!clan) {
                    return interaction.message.edit({ content: 'This clan no longer exists.', components: [disabledRow], embeds: [] });
                }

                if (decision === 'accept') {
                    clan.members = [...clan.members, targetId];
                    await clan.save();

                    try {
                        const role = await interaction.guild.roles.fetch(clan.roleId);
                        const member = await interaction.guild.members.fetch(targetId);
                        if (role && member) await member.roles.add(role);
                    } catch (e) { console.error(`[Invite] Failed to add role ${clan.roleId} to user ${targetId}`, e); }

                    return interaction.message.edit({ content: `<@${targetId}> has accepted the invitation to join **${clan.name}**!`, components: [disabledRow], embeds: [] });

                } else if (decision === 'deny') {
                    return interaction.message.edit({ content: 'The invitation was declined.', components: [disabledRow], embeds: [] });
                }
            }

            // -- Clan Leave Handler --
            if (action === 'leave') {
                const [decision, clanId, userId] = data;

                if (interaction.user.id !== userId) {
                    return interaction.reply({ content: "This is not your confirmation button.", flags: 64 });
                }

                await interaction.deferUpdate();
                const disabledRow = ActionRowBuilder.from(interaction.message.components[0]);
                disabledRow.components.forEach(c => c.setDisabled(true));

                if (decision === 'cancel') {
                    return interaction.message.edit({ content: 'Clan leave operation cancelled.', components: [disabledRow], embeds: [] });
                }

                if (decision === 'confirm') {
                    const clan = await Clan.findByPk(clanId);
                    if (!clan) {
                        return interaction.message.edit({ content: 'This clan no longer exists.', components: [disabledRow], embeds: [] });
                    }

                    clan.members = clan.members.filter(id => id !== userId);
                    clan.officers = clan.officers.filter(id => id !== userId);
                    clan.viceLeaders = clan.viceLeaders.filter(id => id !== userId);
                    await clan.save();

                    try {
                        const role = await interaction.guild.roles.fetch(clan.roleId);
                        const member = await interaction.guild.members.fetch(userId);
                        if (role && member) await member.roles.remove(role);
                    } catch (e) { console.error(`[Leave] Failed to remove role ${clan.roleId} from user ${userId}`, e); }

                    try {
                        const owner = await interaction.client.users.fetch(clan.ownerId);
                        await owner.send(`**Member Left:** ${interaction.user.tag} has left your clan, **${clan.name}**.`);
                    } catch (e) { console.error(`[Leave] Failed to DM clan owner ${clan.ownerId}`, e); }

                    return interaction.message.edit({ content: 'You have successfully left the clan.', components: [disabledRow], embeds: [] });
                }
            }
        }
    },
};