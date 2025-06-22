# NINDO - A Discord Bot

A multi-purpose Discord bot designed exclusively for its intended communities.

## Features

*   **Timestamp Generation:** Easily create dynamic, timezone-aware timestamps for event planning with the `/timestamp` command.
*   **Multi-Server Ready:** Designed from the ground up to work in any Discord server.
*   **Database Integration:** Uses SQLite for persistent data storage.
*   **Process Management:** Runs via PM2 for automatic crash recovery and background operation.

## Setup & Installation (For Authorized Users)

Follow these steps to get a local copy up and running for development or approved deployment.

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
3.  Install the required NPM packages and the global PM2 process manager:
    ```sh
    npm install
    npm install pm2 -g
    ```
4.  Create a `.env` file in the root directory. Copy the contents of `.env.example` and fill in your bot's credentials from the [Discord Developer Portal](https://discord.com/developers/applications).
    *   `TOKEN`: Your bot's secret token.
    *   `CLIENT_ID`: Your bot's application/client ID.

### Deploying Commands

Before starting the bot for the first time, you must register its slash commands with Discord. Run the following command:
```sh
npm run deploy
```

You only need to run this command again if you add or modify command definitions in the future.

## Running and Managing the Bot

This project uses **PM2 (Process Manager 2)** to keep the bot running continuously. PM2 will automatically restart the bot if it crashes and allows it to run in the background, so you can close your terminal.

### Starting the Bot

To start the bot for the first time and have it run in the background, use:
```sh
npm start
```

### Managing the Bot

Once the bot is running, you can manage it with these commands from your terminal:

*   **To view live logs (console output):**
    ```sh
    npm run logs
    ```
    *(Press `Ctrl+C` to exit the log view. The bot will continue running.)*

*   **To restart the bot (useful after updating code):**
    ```sh
    npm run restart
    ```

*   **To stop the bot completely:**
    ```sh
    npm run stop
    ```

*   **To view the status of all applications managed by PM2:**
    ```sh
    pm2 list
    ```

## License and Usage

**Copyright (c) 2025 Sorodyn. All Rights Reserved.**

This project is source-available but is under a **proprietary license**. You are welcome to view the code for educational purposes.

However, you are **not permitted** to use, copy, modify, or distribute this software without obtaining explicit written permission from the copyright holder. Please see the `LICENSE` file for full details.