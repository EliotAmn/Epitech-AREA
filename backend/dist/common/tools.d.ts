export declare function mapRecord<T, U>(record: Record<string, T>, mapper: (key: string, value: T) => U): Record<string, U>;
