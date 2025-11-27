import {ServiceDefinition} from "../../service.types";

export default class DiscordService implements ServiceDefinition {
    name = 'discord';
    label = 'Discord';
    description = 'Interract with your discord servers'
    actions = [];
    reactions = [];
}