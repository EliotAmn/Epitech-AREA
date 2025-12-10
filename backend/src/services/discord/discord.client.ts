import {
  Client,
  Events,
  GatewayIntentBits,
  GuildMember,
  Message,
} from 'discord.js';

export class DiscordClientManager {
  private static instance: DiscordClientManager;
  private client: Client | null = null;
  private isReady: boolean = false;
  private messageHandlers: Map<string, (message: Message) => void> = new Map();
  private memberJoinHandlers: Map<string, (member: GuildMember) => void> =
    new Map();

  private constructor() {}

  public static getInstance(): DiscordClientManager {
    if (!DiscordClientManager.instance) {
      DiscordClientManager.instance = new DiscordClientManager();
    }
    return DiscordClientManager.instance;
  }

  public async initialize(token: string): Promise<void> {
    if (this.client && this.isReady) {
      console.log('Discord client already initialized');
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
      ],
    });

    this.client.once(Events.ClientReady, (readyClient) => {
      console.log(`✅ Discord bot ready! Logged in as ${readyClient.user.tag}`);
      console.log(`📊 Connected to ${readyClient.guilds.cache.size} server(s)`);
      this.isReady = true;
    });

    // Handle messages
    this.client.on(Events.MessageCreate, (message) => {
      if (message.author.bot) return;
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    });

    // Handle member joins
    this.client.on(Events.GuildMemberAdd, (member) => {
      console.log(
        `👋 Member joined: ${member.user.username} in ${member.guild.name}`,
      );
      console.log(`   Active handlers: ${this.memberJoinHandlers.size}`);

      this.memberJoinHandlers.forEach((handler) => {
        try {
          handler(member);
        } catch (error) {
          console.error('Error in member join handler:', error);
        }
      });
    });

    await this.client.login(token);
  }

  public getClient(): Client {
    if (!this.client || !this.isReady) {
      throw new Error(
        'Discord client not initialized. Call initialize() first.',
      );
    }
    return this.client;
  }

  public isClientReady(): boolean {
    return this.isReady;
  }

  public registerMessageHandler(
    id: string,
    handler: (message: Message) => void,
  ): void {
    this.messageHandlers.set(id, handler);
  }

  public unregisterMessageHandler(id: string): void {
    this.messageHandlers.delete(id);
  }

  public registerMemberJoinHandler(
    id: string,
    handler: (member: GuildMember) => void,
  ): void {
    this.memberJoinHandlers.set(id, handler);
  }

  public unregisterMemberJoinHandler(id: string): void {
    this.memberJoinHandlers.delete(id);
  }

  public async destroy(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.messageHandlers.clear();
      this.memberJoinHandlers.clear();
    }
  }
}

// Helper function to get the Discord client
export function getDiscordClient(): Client {
  return DiscordClientManager.getInstance().getClient();
}

// Helper function to check if client is ready
export function isDiscordClientReady(): boolean {
  return DiscordClientManager.getInstance().isClientReady();
}
