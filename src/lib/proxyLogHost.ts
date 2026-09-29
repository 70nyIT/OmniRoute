/**
 * Canonical host normalization for proxy log writes and (host, port) lookups:
 * trim, strip exactly one pair of surrounding brackets from IPv6 literals
 * ("[2001:db8::1]"), re-trim, lowercase. Anything that is not a non-empty
 * string normalizes to null so readers can fall back to today's behavior.
 *
 * Kept in a dependency-free leaf: `src/lib/db/proxyLogs.ts` needs it, and
 * importing it from `proxyLogger.ts` dragged that module's import-time SQLite
 * hydration into every chain that reaches `db/proxies` (e.g. the compression
 * pipeline via modelCapabilities → db/settings → db/proxies/rotation).
 */
export function normalizeProxyHostForLog(host: unknown): string | null {
  if (typeof host !== "string") return null;
  const trimmed = host.trim();
  if (!trimmed) return null;
  const unbracketed =
    trimmed.startsWith("[") && trimmed.endsWith("]") && trimmed.length > 2
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  if (!unbracketed) return null;
  return unbracketed.toLowerCase();
}
