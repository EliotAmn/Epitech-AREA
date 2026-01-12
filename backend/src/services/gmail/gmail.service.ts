import { ServiceDefinition } from '@/common/service.types';
import { SendEmailReaction } from './reactions/send-email.reaction';

export default class GmailService implements ServiceDefinition {
  name = 'gmail';
  label = 'Gmail';
  color = '#EA4335';
  logo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/1280px-Gmail_icon_%282020%29.svg.png';
  description =
    'Send emails on behalf of a user authenticated via Google OAuth';

  actions = [];
  reactions = [SendEmailReaction];
  oauth_url = 'https://bd6379adde31.ngrok-free.app/auth/google';
}
