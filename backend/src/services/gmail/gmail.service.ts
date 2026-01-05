import { ServiceDefinition } from '@/common/service.types';
import { SendEmailReaction } from './reactions/send-email.reaction';

export default class GmailService implements ServiceDefinition {
  name = 'gmail';
  label = 'Gmail';
  description =
    'Send emails on behalf of a user authenticated via Google OAuth';

  actions = [];
  reactions = [SendEmailReaction];
}
