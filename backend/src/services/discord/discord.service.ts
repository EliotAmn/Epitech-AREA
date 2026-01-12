import { ServiceDefinition } from '@/common/service.types';
import { MessageContainsKeywordAction } from './actions/message-contains-keyword.action';
import { NewMessageInChannelAction } from './actions/new-message-in-channel.action';
import { UserJoinedServerAction } from './actions/user-joined-server.action';
import { AddRoleToUserReaction } from './reactions/add-role-to-user.reaction';
import { SendDirectMessageReaction } from './reactions/send-direct-message.reaction';
import { SendMessageToChannelReaction } from './reactions/send-message-to-channel.reaction';

export default class DiscordService implements ServiceDefinition {
  name = 'discord';
  label = 'Discord';
  color = '#5865F2';
  logo = 'https://discord.com/assets/145dc557845548a36a82337912ca3ac5.svg';
  description =
    'Discord bot integration with OAuth for server management and automation';

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
