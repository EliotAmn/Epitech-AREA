declare class ActionDto {
    action_name: string;
    params?: Record<string, unknown>;
}
declare class ReactionDto {
    reaction_name: string;
    params?: Record<string, unknown>;
}
export declare class CreateAreaDto {
    name: string;
    actions: ActionDto[];
    reactions: ReactionDto[];
}
export {};
