# NINDO Bot Command List

This document provides a complete list of all slash commands available for the NINDO bot.

---

## User Commands

These commands are available to all users, though some may require specific clan permissions to execute.

### `/clan` - Core Clan Management
The central command for all clan-related actions.

*   **/clan help**
    *   **Description:** Shows a helpful guide detailing which clan commands you can use based on your authority level.
    *   **Usage:** `/clan help`

*   **/clan view `[clan_role]`**
    *   **Description:** Displays a detailed embed with the name, motto, leader, officers, and members of a clan.
    *   **Usage:** `/clan view` (to see your own clan) or `/clan view clan_role:@RoleName` (to see a specific clan).

*   **/clan invite `<user>`**
    *   **Description:** (Vice Leader & above) Sends a 1-minute invitation to another user to join your clan.
    *   **Usage:** `/clan invite user:@Username`

*   **/clan kick `<user> [reason]`**
    *   **Description:** (Officer & above) Removes a member from your clan. You cannot kick members of equal or higher authority.
    *   **Usage:** `/clan kick user:@Username reason:For inactivity`

*   **/clan authority `<user> <level>`**
    *   **Description:** (Vice Leader & above) Promotes or demotes a member within your clan.
    *   **Usage:** `/clan authority user:@Username level:Officer`

*   **/clan motto `<text>`**
    *   **Description:** (Clan Leader only) Sets or updates your clan's motto.
    *   **Usage:** `/clan motto text:Peace through power.`

*   **/clan color `<hex>`**
    *   **Description:** (Clan Leader only) Changes the color of your clan's associated Discord role.
    *   **Usage:** `/clan color hex:#FF5733`

*   **/clan leave `[reason]`**
    *   **Description:** Allows you to leave the clan you are currently in. The clan owner will be notified.
    *   **Usage:** `/clan leave`

### `/help` - Help & Information
Provides access to the server's help guide.

*   **/help dashboard**
    *   **Description:** Displays an interactive dropdown menu with a list of all available help topics. Selecting a topic shows its detailed answer.
    *   **Usage:** `/help dashboard`

### `/timestamp` - Utility
A simple tool for creating dynamic timestamps.

*   **/timestamp `<datetime> [format]`**
    *   **Description:** Converts a natural language date/time (e.g., "in 2 hours", "tomorrow at 5pm") into a dynamic Discord timestamp that displays correctly for everyone in their local time.
    *   **Usage:** `/timestamp datetime:next Friday at 8pm`

---

## Admin Commands

These commands are restricted and can only be used by users whose IDs are listed in the bot's `config.json` file.

### `/admin` - Bot Administration
The central command for all administrative actions.

*   **/admin help**
    *   **Description:** Shows a private guide listing all available admin commands and their functions.
    *   **Usage:** `/admin help`

*   **/admin clan create `<owner> <name> <role>`**
    *   **Description:** Creates a new clan, assigns a user as its owner, and binds it to an existing Discord role.
    *   **Usage:** `/admin clan create owner:@Username name:ClanName role:@RoleName`

*   **/admin clan change_owner `<clan_role> <new_owner>`**
    *   **Description:** Transfers ownership of an existing clan from the current owner to a new user.
    *   **Usage:** `/admin clan change_owner clan_role:@RoleName new_owner:@NewUsername`

*   **/admin guide add `<name> <message_id>`**
    *   **Description:** Adds a new topic to the `/help dashboard`. The content of the specified message ID is used as the topic's answer.
    *   **Usage:** `/admin guide add name:How to Join message_id:123456789012345678`

*   **/admin guide remove `<name>`**
    *   **Description:** Removes a topic from the `/help dashboard` by its unique name.
    *   **Usage:** `/admin guide remove name:How to Join`

*   **/admin guide edit `<name> <new_message_id>`**
    *   **Description:** Updates an existing help topic with the content from a new message ID.
    *   **Usage:** `/admin guide edit name:How to Join new_message_id:098765432109876543`