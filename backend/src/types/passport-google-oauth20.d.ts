declare module 'passport-google-oauth20' {
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL?: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export class Strategy {
    constructor(options: StrategyOptions, verify?: any);
  }

  export { Strategy as Strategy };
}
