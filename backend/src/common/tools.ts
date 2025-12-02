export function mapRecord<T, U>(
    record: Record<string, T>,
    mapper: (key: string, value: T, ) => U
): Record<string, U> {
    return Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key, mapper(key, value)])
    );
}
