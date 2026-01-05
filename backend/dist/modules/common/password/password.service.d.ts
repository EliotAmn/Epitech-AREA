export declare class PasswordService {
    private readonly saltRounds;
    private readonly hashFn;
    private readonly compareFn;
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}
