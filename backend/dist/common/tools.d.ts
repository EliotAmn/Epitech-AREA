export declare function mapRecord<T, U>(record: Record<string, T>, mapper: (key: string, value: T) => U): Record<string, U>;
export declare function buildUrlParameters(basepath: string, params: {
    [key: string]: string | number | boolean | undefined;
}): string;
export declare function buildServiceRedirectUrl(service_name: string): string;
