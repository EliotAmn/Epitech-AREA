import { ServiceDefinition } from '@/common/service.types';
import { SendEmailReaction } from './reactions/send-email.reaction';
export default class GmailService implements ServiceDefinition {
    name: string;
    label: string;
    description: string;
    actions: never[];
    reactions: (typeof SendEmailReaction)[];
}
