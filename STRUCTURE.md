NINDODB/
├── .git/                     # Git version control directory
├── commands/
│   ├── admin/
│   │   └── admin.js          # Handles all /admin subcommands (clan and guide)
│   └── utility/
│       ├── clan.js           # Handles all user-facing /clan commands
│       ├── help.js           # Handles the /help dashboard command
│       └── timestamp.js      # Handles the /timestamp command
├── database/
│   └── database.js           # Sequelize setup and all model definitions (User, Clan, HelpQuestion)
├── events/
│   ├── guildMemberAdd.js     # Adds new server members to the database
│   ├── guildRoleDelete.js    # Cleans up clans if their role is deleted
│   ├── interactionCreate.js  # Handles all command, button, and menu interactions
│   └── ready.js              # Runs on bot startup, syncs database and users
├── node_modules/             # All project dependencies (ignored by git)
├── src/
│   ├── config.json           # Your list of admin user IDs
│   ├── deploy-commands.js    # Script to register slash commands with Discord
│   └── index.js              # The main entry point for the bot application
└── utils/
    └── clanManager.js        # Helper functions for clan-related logic

# --- Root Files ---
├── .env                      # Your secret tokens and IDs (ignored by git)
├── .env.example              # Example of the .env file structure
├── .gitattributes            # Git configuration file
├── .gitignore                # Specifies files and folders for Git to ignore
├── LICENSE                   # Your custom "All Rights Reserved" license
├── package-lock.json         # Records exact versions of dependencies
├── package.json              # Defines project metadata and dependencies
└── README.md                 # Your project's documentation