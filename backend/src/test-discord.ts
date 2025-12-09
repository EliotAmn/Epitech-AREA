import { DiscordClientManager } from './services/discord/discord.client';
import { NewMessageInChannelAction } from './services/discord/actions/new-message-in-channel.action';
import { UserJoinedServerAction } from './services/discord/actions/user-joined-server.action';
import { MessageContainsKeywordAction } from './services/discord/actions/message-contains-keyword.action';
import { SendMessageToChannelReaction } from './services/discord/reactions/send-message-to-channel.reaction';
import { SendDirectMessageReaction } from './services/discord/reactions/send-direct-message.reaction';
import { AddRoleToUserReaction } from './services/discord/reactions/add-role-to-user.reaction';
import { ParameterType } from './common/service.types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDiscordService() {
    console.log('🧪 Testing Discord Service\n');
    
    // Test 1: Initialize Discord Client
    console.log('1️⃣ Testing Discord Client Initialization...');
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
        console.error('❌ DISCORD_BOT_TOKEN not found in .env file');
        console.log('Please add DISCORD_BOT_TOKEN=your_token_here to your .env file\n');
        return;
    }
    
    try {
        await DiscordClientManager.getInstance().initialize(token);
        console.log('✅ Discord client initialized successfully\n');
        
        // Wait a bit for the client to be fully ready
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (!DiscordClientManager.getInstance().isClientReady()) {
            console.error('❌ Discord client not ready after initialization\n');
            return;
        }
        
        console.log('✅ Discord client is ready\n');
    } catch (error) {
        console.error('❌ Failed to initialize Discord client:', error);
        return;
    }
    
    // Test 2: Test Actions Instantiation
    console.log('2️⃣ Testing Actions Instantiation...');
    try {
        const newMessageAction = new NewMessageInChannelAction();
        console.log(`✅ ${newMessageAction.name} - ${newMessageAction.label}`);
        
        const userJoinedAction = new UserJoinedServerAction();
        console.log(`✅ ${userJoinedAction.name} - ${userJoinedAction.label}`);
        
        const keywordAction = new MessageContainsKeywordAction();
        console.log(`✅ ${keywordAction.name} - ${keywordAction.label}\n`);
    } catch (error) {
        console.error('❌ Failed to instantiate actions:', error);
        return;
    }
    
    // Test 3: Test Reactions Instantiation
    console.log('3️⃣ Testing Reactions Instantiation...');
    try {
        const sendMessageReaction = new SendMessageToChannelReaction();
        console.log(`✅ ${sendMessageReaction.name} - ${sendMessageReaction.description}`);
        
        const sendDMReaction = new SendDirectMessageReaction();
        console.log(`✅ ${sendDMReaction.name} - ${sendDMReaction.description}`);
        
        const addRoleReaction = new AddRoleToUserReaction();
        console.log(`✅ ${addRoleReaction.name} - ${addRoleReaction.description}\n`);
    } catch (error) {
        console.error('❌ Failed to instantiate reactions:', error);
        return;
    }
    
    // Test 4: Test Action with Event Listener (Message Keyword)
    console.log('4️⃣ Testing Message Keyword Action...');
    console.log('📝 Send a message containing "test" in any channel the bot can see');
    console.log('⏱️  Waiting 30 seconds for a message...\n');
    
    const keywordAction = new MessageContainsKeywordAction();
    await keywordAction.reload_cache({
        config: {
            keyword: 'test',
        }
    });
    
    // Poll for 30 seconds
    let triggered = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = await keywordAction.poll({ config: { keyword: 'test' } });
        
        if (result.triggered) {
            console.log('✅ Message with keyword detected!');
            console.log('   Content:', result.parameters.message_content?.value);
            console.log('   Author:', result.parameters.author?.value);
            console.log('   Channel:', result.parameters.channel_name?.value);
            console.log('   Keyword:', result.parameters.keyword_found?.value);
            console.log('');
            triggered = true;
            break;
        }
    }''
    
    if (!triggered) {
        console.log('⚠️  No message detected (this is OK if you didn\'t send one)\n');
    }
    
    // Test 5: Test Send Message Reaction (Optional - requires channel ID)
    const testChannelId = process.env.TEST_CHANNEL_ID;
    
    if (testChannelId) {
        console.log('5️⃣ Testing Send Message Reaction...');
        try {
            const sendMessageReaction = new SendMessageToChannelReaction();
            await sendMessageReaction.execute(
                { config: {} },
                {
                    channel_id: { type: ParameterType.STRING, value: testChannelId },
                    message: { type: ParameterType.STRING, value: '🤖 Test message from Discord AREA service!' }
                }
            );
            console.log('✅ Test message sent successfully!\n');
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            console.log('');
        }
    } else {
        console.log('5️⃣ Skipping Send Message Reaction test (add TEST_CHANNEL_ID to .env to enable)\n');
    }
    
    // Summary
    console.log('🎉 Discord Service Tests Complete!');
    console.log('\n📋 Summary:');
    console.log('  - Discord client: ✅ Working');
    console.log('  - Actions: ✅ All instantiated correctly');
    console.log('  - Reactions: ✅ All instantiated correctly');
    console.log('  - Event listeners: ' + (triggered ? '✅ Working' : '⚠️  Not tested'));
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await DiscordClientManager.getInstance().destroy();
    console.log('✅ Done!\n');
    
    process.exit(0);
}

// Run tests
testDiscordService().catch(error => {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
});
