import { UserService } from '@prisma/client';
import { ServiceDefinition } from '@/common/service.types';
import { PlayingStateUpdated } from '@/services/spotify/actions/playing-state-updated';
declare function oauth_callback(userService: UserService, params: {
    [key: string]: string;
}): Promise<boolean>;
export default class SpotifyService implements ServiceDefinition {
    name: string;
    label: string;
    mandatory_env_vars: string[];
    oauth_url: string;
    oauth_callback: typeof oauth_callback;
    description: string;
    actions: (typeof PlayingStateUpdated)[];
    reactions: never[];
}
export {};
