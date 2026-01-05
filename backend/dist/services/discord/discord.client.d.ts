import { Client, GuildMember, Message } from 'discord.js';
export declare class DiscordClientManager {
    private static instance;
    private client;
    private isReady;
    private messageHandlers;
    private memberJoinHandlers;
    private constructor();
    static getInstance(): DiscordClientManager;
    initialize(token: string): Promise<void>;
    getClient(): Client;
    isClientReady(): boolean;
    registerMessageHandler(id: string, handler: (message: Message) => void): void;
    unregisterMessageHandler(id: string): void;
    registerMemberJoinHandler(id: string, handler: (member: GuildMember) => void): void;
    unregisterMemberJoinHandler(id: string): void;
    destroy(): Promise<void>;
}
export declare function getDiscordClient(): Client;
export declare function isDiscordClientReady(): boolean;
