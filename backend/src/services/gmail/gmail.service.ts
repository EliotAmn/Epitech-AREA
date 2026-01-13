import { ServiceDefinition } from '@/common/service.types';
import { SendEmailReaction } from './reactions/send-email.reaction';

export default class GmailService implements ServiceDefinition {
  name = 'gmail';
  label = 'Gmail';
  color = '#EA4335';
  logo = 'https://img.icons8.com/ios_filled/512/FFFFFF/gmail-new.png';
  description =
    'Send emails on behalf of a user authenticated via Google OAuth';

  actions = [];
  reactions = [SendEmailReaction];
  oauth_url = process.env.APP_URL ? process.env.APP_URL + '/auth/google' : '';
}
