"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayingStateUpdated = void 0;
const axios_1 = __importDefault(require("axios"));
const service_types_1 = require("../../../common/service.types");
class PlayingStateUpdated extends service_types_1.ServiceActionDefinition {
    name = 'spotify.playing_state_updated';
    label = 'On playing state updated';
    description = 'When the playing state is updated (play/pause)';
    poll_interval = 10;
    output_params = [
        {
            name: 'song_name',
            type: service_types_1.ParameterType.STRING,
            label: 'Song Name',
            description: 'The name of the song',
            required: true,
        },
    ];
    input_params = [
        {
            name: 'state',
            type: service_types_1.ParameterType.SELECT,
            label: 'Trigger on state',
            description: 'Select the playing state to trigger on',
            required: true,
            options: [
                { label: 'Play', value: 'play' },
                { label: 'Pause', value: 'pause' },
                { label: 'Both', value: 'both' },
            ],
        },
    ];
    reload_cache() {
        return Promise.resolve({ lastPlayingState: null });
    }
    poll(sconf) {
        const accessToken = sconf.config.access_token;
        if (!accessToken)
            return Promise.resolve({ triggered: false, parameters: {} });
        const lastPlayingState = sconf.cache?.lastPlayingState;
        return new Promise((resolve) => {
            axios_1.default
                .get('https://api.spotify.com/v1/me/player', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
                .then((resp) => {
                if (resp.status === 204) {
                    return resolve({ triggered: false, parameters: {} });
                }
                const data = resp.data;
                if (!data || !data.item) {
                    return resolve({ triggered: false, parameters: {} });
                }
                const isPlaying = data.is_playing;
                const songName = data.item.name;
                const currentState = isPlaying ? 'play' : 'pause';
                const triggerState = sconf.config.state || 'both';
                let triggered = false;
                if (lastPlayingState !== currentState) {
                    if (triggerState === 'both' || triggerState === currentState) {
                        triggered = true;
                    }
                }
                if (triggered) {
                    resolve({
                        triggered: true,
                        parameters: {
                            song_name: { type: service_types_1.ParameterType.STRING, value: songName },
                        },
                        cache: { lastPlayingState: currentState },
                    });
                }
                else {
                    resolve({
                        triggered: false,
                        parameters: {},
                        cache: { lastPlayingState: currentState },
                    });
                }
            })
                .catch((err) => {
                console.error('Error polling Spotify playing state:', err);
                resolve({ triggered: false, parameters: {} });
            });
        });
    }
}
exports.PlayingStateUpdated = PlayingStateUpdated;
//# sourceMappingURL=playing-state-updated.js.map