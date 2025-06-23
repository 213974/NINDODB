// src/deploy-commands.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandFolders = fs.readdirSync(path.join(__dirname, '..', 'commands'));

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        // --- IMPORTANT: Skip deploying the admin command ---
        if (file === 'admin.js') {
            console.log(`[DEPLOY] Skipping global deployment for: ${file}`);
            continue;
        }

        const filePath = path.join(__dirname, '..', 'commands', folder, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`[DEPLOY] Added command to deployment list: /${command.data.name}`);
        }
    }
}

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.DEV_GUILD_ID;

if (!token || !clientId) {
    console.error('Error: TOKEN or CLIENT_ID is missing from .env file.');
    process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Check if a development guild ID is provided
        if (guildId) {
            // Deploy commands to the development guild INSTANTLY
            console.log(`Deploying commands to development guild: ${guildId}`);
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
            console.log(`Successfully reloaded commands for development guild.`);
        } else {
            // Deploy commands globally for production (takes up to 1 hour)
            console.log('Deploying commands globally.');
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
            console.log(`Successfully reloaded commands globally.`);
        }

    } catch (error) {
        console.error(error);
    }
})();