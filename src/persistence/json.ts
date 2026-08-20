export function parseArray<T, R>(raw: string | null, map: (item: T) => R): R[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => map(item as T));
  } catch {
    return [];
  }
}
