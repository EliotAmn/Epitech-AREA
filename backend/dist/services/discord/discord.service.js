"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_contains_keyword_action_1 = require("./actions/message-contains-keyword.action");
const new_message_in_channel_action_1 = require("./actions/new-message-in-channel.action");
const user_joined_server_action_1 = require("./actions/user-joined-server.action");
const add_role_to_user_reaction_1 = require("./reactions/add-role-to-user.reaction");
const send_direct_message_reaction_1 = require("./reactions/send-direct-message.reaction");
const send_message_to_channel_reaction_1 = require("./reactions/send-message-to-channel.reaction");
class DiscordService {
    name = 'discord';
    label = 'Discord';
    description = 'Discord bot integration with OAuth for server management and automation';
    actions = [
        new_message_in_channel_action_1.NewMessageInChannelAction,
        user_joined_server_action_1.UserJoinedServerAction,
        message_contains_keyword_action_1.MessageContainsKeywordAction,
    ];
    reactions = [
        send_message_to_channel_reaction_1.SendMessageToChannelReaction,
        add_role_to_user_reaction_1.AddRoleToUserReaction,
        send_direct_message_reaction_1.SendDirectMessageReaction,
    ];
}
exports.default = DiscordService;
//# sourceMappingURL=discord.service.js.map