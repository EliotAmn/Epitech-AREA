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
  logo =
    'https://www.pngkey.com/png/full/19-199827_discord-logo-black-and-white-white-photo-for.png';
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
