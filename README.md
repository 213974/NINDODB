
### discord.gg/rbxnindo

## discord.gg/rbxnindo

# discord.gg/rbxnindo

░██████╗░█████╗░██████╗░░█████╗░██████╗░██╗░░░██╗███╗░░██╗
██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚██╗░██╔╝████╗░██║
╚█████╗░██║░░██║██████╔╝██║░░██║██║░░██║░╚████╔╝░██╔██╗██║
░╚═══██╗██║░░██║██╔══██╗██║░░██║██║░░██║░░╚██╔╝░░██║╚████║
██████╔╝╚█████╔╝██║░░██║╚█████╔╝██████╔╝░░░██║░░░██║░╚███║
╚═════╝░░╚════╝░╚═╝░░╚═╝░╚════╝░╚═════╝░░░░╚═╝░░░╚═╝░░╚══╝

# discord.gg/rbxnindo

## discord.gg/rbxnindo

### discord.gg/rbxnindo

# NINDO - A Discord Bot

A multi-purpose Discord bot designed exclusively for its intended communities.

## Features

*   **Advanced Clan System:** Full creation, management, and authority controls for clans.
*   **Dynamic Help Guide:** An admin-managed, dropdown-based help dashboard.
*   **Persistent Database:** Uses SQLite for robust data storage of users and clans.
*   **Reliable Operation:** Runs via PM2 for automatic crash recovery and backgrounding.
*   **Timestamp Generation:** Easily create dynamic, timezone-aware timestamps.
*   **Multi-Server Ready:** Designed from the ground up to work in any Discord server.

## Setup & Installation (For Authorized Users)

Follow these steps to get a local copy up and running.

If you run into any problems add `solonovo` on discord.

### Prerequisites

You will need **Node.js (v18.x or higher)** installed.
*   [Node.js Download](https://nodejs.org/)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/213974/NINDODB.git
    ```
2.  Navigate into the project directory:
    ```sh
    cd NINDODB
    ```
3.  **Install Dependencies:**
    ```sh
    # This installs all required project dependencies (discord.js, sequelize, etc.)
    npm install
    
    # This installs the PM2 process manager globally on your system
    npm install pm2 -g
    ```

4.  **Configure Environment:** Create a `.env` file by copying `.env.example`. Then, fill in the values.
    *   `TOKEN`: Your bot's secret token.
    *   `CLIENT_ID`: Your bot's application/client ID.
    *   `DEV_GUILD_ID`: (Optional) The ID of your private testing server. Using this makes commands update instantly during development.

### Deploying Commands

Before starting the bot, you must register its slash commands with Discord.

```sh
npm run deploy
```
*   If you set `DEV_GUILD_ID` in your `.env` file, commands will update **instantly** in that server only.
*   If `DEV_GUILD_ID` is blank, commands will be deployed **globally**. This is for production and may take **up to an hour** to appear in all servers.

## Running and Managing the Bot

This project uses **PM2** to keep the bot running continuously.

### Starting the Bot
```sh
npm start
```

### Managing the Bot
*   **To view live logs:** `npm run logs`
*   **To restart the bot:** `npm run restart`
*   **To stop the bot:** `npm run stop`
*   **To view PM2 status:** `pm2 list`

## Project Maintenance

### Updating PM2
To update PM2 to its latest version, run `pm2 update`.

## License and Usage

**Copyright (c) 2025 NINDO. All Rights Reserved.**

This project is source-available but is under a **proprietary license**. You are welcome to view the code for educational purposes.

However, you are **not permitted** to use, copy, modify, or distribute this software without obtaining explicit written permission from the copyright holder. Please see the `LICENSE` file for full details.