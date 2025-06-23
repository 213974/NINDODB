// src/index.js
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { sequelize } = require('../database/database.js');
const config = require('./config.json');

// --- User to be notified ---
const ADMIN_USER_ID = '431407603814367233';

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
client.dmStatusCooldowns = new Collection();
client.globalDmStatusCooldown = 0;

// --- Load Commands ---
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFolders = fs.readdirSync(commandsPath);
for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, '..', 'commands', folder)
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

// --- Load Events ---
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

// --- Authenticate and Login ---
(async () => {
    try {
        await sequelize.authenticate();
        console.log('[DATABASE] Connection has been established successfully.');
        await client.login(token);
    } catch (error) {
        console.error('[DATABASE/LOGIN] Unable to start bot:', error);
    }
})();

// --- Global Error & Shutdown Handling ---

// Function to notify the admin
const notifyAdmin = async (embed) => {
    try {
        const adminUser = await client.users.fetch(ADMIN_USER_ID);
        if (adminUser) {
            await adminUser.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error('Failed to send DM to admin user.', e);
    }
};

// Listen for uncaught exceptions (crashes)
process.on('uncaughtException', async (err) => {
    console.error('--- UNCAUGHT EXCEPTION ---', err);
    const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Fatal Error Occurred')
        .setDescription('The bot has encountered an uncaught exception and has crashed. It will be restarted by PM2.')
        .addFields({ name: 'Error', value: `\`\`\`${err.stack.slice(0, 1018)}\`\`\`` })
        .setTimestamp();
    await notifyAdmin(errorEmbed);
    process.exit(1); // Exit so PM2 can restart
});

// Listen for graceful shutdowns (e.g., pm2 stop)
const handleShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully.`);
    const shutdownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('Bot Shutting Down')
        .setDescription(`The bot is shutting down due to a \`${signal}\` signal.`)
        .setTimestamp();
    await notifyAdmin(shutdownEmbed);
    client.destroy();
    process.exit(0);
};

process.on('SIGINT', handleShutdown);  // Handles Ctrl+C
process.on('SIGTERM', handleShutdown); // Handles `pm2 stop`