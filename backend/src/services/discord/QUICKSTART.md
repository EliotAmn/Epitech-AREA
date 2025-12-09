# Quick Start - Discord Bot Setup

## 🚀 5 Minutes Setup

### 1. Create Bot (2 min)
- Go to https://discord.com/developers/applications
- New Application → Add Bot
- Enable **Message Content Intent** & **Server Members Intent**
- Copy Token

### 2. Add to .env (30 sec)
```env
DISCORD_BOT_TOKEN=your_token_here
TEST_CHANNEL_ID=your_test_channel_id  # Optional
```

### 3. Invite Bot (1 min)
Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=269872192&scope=bot%20applications.commands
```

Find your Client ID in: Developer Portal → General Information → Application ID

### 4. Start & Test (1 min)
```bash
npm run start:dev
# or
npm run test:discord
```

### 5. Get IDs
Enable Developer Mode in Discord:
- User Settings → Advanced → Developer Mode ✅

Then right-click on:
- Channel → Copy Channel ID
- Server → Copy Server ID  
- User → Copy User ID
- Role → Copy Role ID

## ✅ Verify It Works

Bot should be **online** in your server and logs should show:
```
Discord bot ready! Logged in as YourBot#1234
```

---

📖 For detailed instructions, see [SETUP.md](./SETUP.md)
