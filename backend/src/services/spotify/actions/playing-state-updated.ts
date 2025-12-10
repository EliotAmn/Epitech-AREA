import {ParameterType, ServiceActionDefinition} from '@/common/service.types';
import type {
    ActionTriggerOutput,
    ParameterDefinition,
    ServiceConfig,
} from '@/common/service.types';
import axios from "axios";

export class PlayingStateUpdated extends ServiceActionDefinition {
    name = 'spotify.playing_state_updated';
    label = 'On playing state updated';
    description = 'When the playing state is updated (play/pause)';
    output_params: ParameterDefinition[] = [
        {
            name: 'song_name',
            type: ParameterType.STRING,
            label: 'Song Name',
            description: 'The name of the song',
            required: true,
        },
    ];
    input_params: ParameterDefinition[] = [
        {
            name: 'state',
            type: ParameterType.SELECT,
            label: 'Trigger on state',
            description: 'Select the playing state to trigger on',
            required: true,
            options: [
                {label: 'Play', value: 'play'},
                {label: 'Pause', value: 'pause'},
                {label: 'Both', value: 'both'},
            ],
        },
    ];

    private lastPlayingState: "play" | "pause" | null = null;

    reload_cache(): Promise<Record<string, unknown>> {
        return Promise.resolve({});
    }

    poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
        const apitoken = sconf.config.apitoken as string | undefined;
        if (!apitoken)
            return Promise.resolve({triggered: false, parameters: {}});

        return new Promise((resolve, reject) => {
            axios.get("https://api.spotify.com/v1/me/player", {
                headers: {
                    Authorization: `Bearer ${apitoken}`,
                },
            }).then((resp) => {
                const data = resp.data;
                if (!data || !data.item) {
                    return resolve({triggered: false, parameters: {}});
                }
                const isPlaying: boolean = data.is_playing;
                const songName: string = data.item.name;
                const currentState: "play" | "pause" = isPlaying ? "play" : "pause";
                const triggerState: string = sconf.config.state || "both";

                let triggered = false;
                if (this.lastPlayingState !== currentState) {
                    if (triggerState === "both" || triggerState === currentState) {
                        triggered = true;
                    }
                }

                this.lastPlayingState = currentState;

                if (triggered) {
                    resolve({
                        triggered: true,
                        parameters: {
                            song_name: {type: ParameterType.STRING, value: songName},
                        },
                    });
                } else {
                    resolve({triggered: false, parameters: {}});
                }
            }).catch((err) => {
                console.error("Error polling Spotify playing state:", err);
                resolve({triggered: false, parameters: {}});
            });
        })
    }
}
