export function mapRecord<T, U>(
  record: Record<string, T>,
  mapper: (key: string, value: T) => U,
): Record<string, U> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, mapper(key, value)]),
  );
}

export function buildUrlParameters(basepath: string, params: { [key: string]: string | number | boolean | undefined }): string {
  const urlParams = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (value !== undefined) {
      urlParams.append(key, String(value));
    }
  }
  const paramString = urlParams.toString();
  return paramString ? `?${paramString}` : '';
}