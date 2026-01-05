"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordClientManager = void 0;
exports.getDiscordClient = getDiscordClient;
exports.isDiscordClientReady = isDiscordClientReady;
const discord_js_1 = require("discord.js");
class DiscordClientManager {
    static instance;
    client = null;
    isReady = false;
    messageHandlers = new Map();
    memberJoinHandlers = new Map();
    constructor() { }
    static getInstance() {
        if (!DiscordClientManager.instance) {
            DiscordClientManager.instance = new DiscordClientManager();
        }
        return DiscordClientManager.instance;
    }
    async initialize(token) {
        if (this.client && this.isReady) {
            console.log('Discord client already initialized');
            return;
        }
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.DirectMessages,
                discord_js_1.GatewayIntentBits.DirectMessageTyping,
            ],
        });
        this.client.once(discord_js_1.Events.ClientReady, (readyClient) => {
            console.log(`Discord bot ready! Logged in as ${readyClient.user.tag}`);
            console.log(`Connected to ${readyClient.guilds.cache.size} server(s)`);
            this.isReady = true;
        });
        this.client.on(discord_js_1.Events.MessageCreate, (message) => {
            if (message.author.bot)
                return;
            this.messageHandlers.forEach((handler) => {
                try {
                    handler(message);
                }
                catch (error) {
                    console.error('Error in message handler:', error);
                }
            });
        });
        this.client.on(discord_js_1.Events.GuildMemberAdd, (member) => {
            console.log(`Member joined: ${member.user.username} in ${member.guild.name}`);
            console.log(`   Active handlers: ${this.memberJoinHandlers.size}`);
            this.memberJoinHandlers.forEach((handler) => {
                try {
                    handler(member);
                }
                catch (error) {
                    console.error('Error in member join handler:', error);
                }
            });
        });
        await this.client.login(token);
    }
    getClient() {
        if (!this.client || !this.isReady) {
            throw new Error('Discord client not initialized. Call initialize() first.');
        }
        return this.client;
    }
    isClientReady() {
        return this.isReady;
    }
    registerMessageHandler(id, handler) {
        this.messageHandlers.set(id, handler);
    }
    unregisterMessageHandler(id) {
        this.messageHandlers.delete(id);
    }
    registerMemberJoinHandler(id, handler) {
        this.memberJoinHandlers.set(id, handler);
    }
    unregisterMemberJoinHandler(id) {
        this.memberJoinHandlers.delete(id);
    }
    async destroy() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            this.isReady = false;
            this.messageHandlers.clear();
            this.memberJoinHandlers.clear();
        }
    }
}
exports.DiscordClientManager = DiscordClientManager;
function getDiscordClient() {
    return DiscordClientManager.getInstance().getClient();
}
function isDiscordClientReady() {
    return DiscordClientManager.getInstance().isClientReady();
}
//# sourceMappingURL=discord.client.js.map