export type Action = {
  id: string;
  name: string;
  description?: string;
  // payload shape the action emits when triggered
  payloadSchema?: unknown;
};

export type Reaction = {
  id: string;
  name: string;
  description?: string;
  // payload shape required to invoke the reaction
  payloadSchema?: unknown;
};

export type TokenValidationResult = {
  valid: boolean;
  reason?: string;
};
