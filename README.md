# ☕️ Telegram Coffee Pairs Bot

This bot is designed to **automatically create random coffee pairs in your Telegram group**. It’s perfect for team-building, knowledge sharing, or just to help group members get to know each other better.

## What does the bot do?

- **Automatically collects the list of group participants** (excluding itself and other bots)
- **Every two weeks** (Monday at 10:00 Minsk time) randomly forms pairs or trios for coffee breaks
- **Posts results** in the group chat
- Allows you to **temporarily exclude** or **return** participants using commands
- Shows a list of active and excluded participants via a command

---

## Quick Start

1. **Clone the repository:**
    ```
    git clone https://github.com/your-username/coffee-pairs-bot.git
    cd coffee-pairs-bot
    ```

2. **Install dependencies:**
    ```
    npm install
    ```

3. **Create a Telegram bot via [@BotFather](https://t.me/BotFather)** and get the token.

4. **Set the token in `index.js`:**
    ```js
    const TOKEN = 'YOUR_BOTFATHER_TOKEN';
    ```

5. **Start the bot:**
    ```
    node bot/index.js
    ```

6. **Add the bot to your Telegram group** and give it admin rights.

7. **That’s it!** The bot will start tracking participants and automatically form coffee pairs on schedule.

---

## Bot Commands

- `/start` — Short info about the bot
- `/help` — Full instructions and menu
- `/pairs` — Manually form pairs right now
- `/status` — View the list of active and excluded participants
- `/exclude @username` — Temporarily exclude a participant from pairing
- `/include @username` — Return a participant to pairing

> You can use these commands in the group or in a private chat with the bot.

---

## Important Details

- The bot **works only in groups** and ignores other bots.
- A user will only be included in the draw if they have written something in the chat at least once.
- Pairs are formed only from the **current active list** of participants.
- All user and exclusion data is saved locally in `data/users.json`.

---

## Good to Know

- The logic is modular — the code is easy to improve.
- Uses `node-cron` for scheduled tasks.
- Can be deployed on any hosting that supports Node.js.

---

## Screenshots

_Add screenshots of the menu or bot messages here (optional)._

---

## Author & Support

Developed and maintained by: _[Your Name or Team]_

Have questions or need custom features?  
Open an Issue or contact the author directly.

---
