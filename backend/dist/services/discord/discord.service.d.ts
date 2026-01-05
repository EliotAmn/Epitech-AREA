import { ServiceDefinition } from '@/common/service.types';
import { MessageContainsKeywordAction } from './actions/message-contains-keyword.action';
import { NewMessageInChannelAction } from './actions/new-message-in-channel.action';
import { UserJoinedServerAction } from './actions/user-joined-server.action';
import { AddRoleToUserReaction } from './reactions/add-role-to-user.reaction';
export default class DiscordService implements ServiceDefinition {
    name: string;
    label: string;
    description: string;
    actions: (typeof MessageContainsKeywordAction | typeof NewMessageInChannelAction | typeof UserJoinedServerAction)[];
    reactions: (typeof AddRoleToUserReaction)[];
}
