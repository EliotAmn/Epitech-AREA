import { ServiceDefinition } from "../../common/service.types";
import { NewMessageInChannelAction } from "./actions/new-message-in-channel.action";
import { UserJoinedServerAction } from "./actions/user-joined-server.action";
import { MessageContainsKeywordAction } from "./actions/message-contains-keyword.action";
import { SendMessageToChannelReaction } from "./reactions/send-message-to-channel.reaction";
import { AddRoleToUserReaction } from "./reactions/add-role-to-user.reaction";
import { SendDirectMessageReaction } from "./reactions/send-direct-message.reaction";

export default class DiscordService implements ServiceDefinition {
    name = "discord";
    label = "Discord";
    description = "Discord bot integration with OAuth for server management and automation";
    
    actions = [
        NewMessageInChannelAction,
        UserJoinedServerAction,
        MessageContainsKeywordAction,
    ];
    
    reactions = [
        SendMessageToChannelReaction,
        AddRoleToUserReaction,
        SendDirectMessageReaction,
    ];
}
