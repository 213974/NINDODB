// src/index.js
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('../database/database.js');
const config = require('./config.json');

const token = process.env.TOKEN;
if (!token) {
    console.error("Error: TOKEN is not defined in your .env file!");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.config = config;
client.commands = new Collection();

// Cooldowns for the DM status feature
client.dmStatusCooldowns = new Collection(); // Per-user cooldown
client.globalDmStatusCooldown = 0;           // Global cooldown

// Load Commands
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}


// Load Events
const eventsPath = path.join(__dirname, '..', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


// Authenticate database and log in to Discord
(async () => {
    try {
        await sequelize.authenticate();
        console.log('[DATABASE] Connection has been established successfully.');

        await client.login(token);
    } catch (error) {
        console.error('[DATABASE/LOGIN] Unable to start bot:', error);
    }
})();