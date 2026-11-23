export type ErrorContext = Record<string, unknown>;
export type ErrorReporter = (error: Error, context?: ErrorContext) => void;

const DEDUPE_WINDOW_MS = 5_000;
const recentErrors = new Map<string, number>();
let reporter: ErrorReporter = (error, context) => console.error('[TalentTrust error]', error, context);

export function normalizeError(value: unknown): Error {
  if (value instanceof Error) return value;
  const error = new Error(value == null ? 'Unknown error' : String(value));
  Object.defineProperty(error, 'cause', { value, configurable: true });
  return error;
}

export function scrubText(value: string): string {
  return value
    .replace(/\bS[A-Z2-7]{55}\b/g, '[REDACTED]')
    .replace(/\b[A-Za-z0-9+/]{80,}={0,2}\b/g, '[REDACTED]')
    .replace(/(\bAuthorization\s*:\s*(?:Bearer\s+)?)[^\s,;]+/gi, '$1[REDACTED]');
}

function scrubContext(context: ErrorContext = {}): ErrorContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, typeof value === 'string' ? scrubText(value) : value]),
  );
}

export function setErrorReporter(next: ErrorReporter | null): void {
  reporter = next ?? ((error, context) => console.error('[TalentTrust error]', error, context));
}

export function reportError(value: unknown, context: ErrorContext = {}): void {
  const normalized = normalizeError(value);
  const error = new Error(scrubText(normalized.message));
  error.name = normalized.name;
  if (normalized.stack) error.stack = scrubText(normalized.stack);
  const safeContext = scrubContext(context);
  let contextKey = '';
  try {
    contextKey = JSON.stringify(safeContext);
  } catch {
    contextKey = '[unserializable]';
  }
  const key = `${error.name}:${error.message}:${contextKey}`;
  const now = Date.now();
  const lastReported = recentErrors.get(key);
  if (lastReported !== undefined && now - lastReported < DEDUPE_WINDOW_MS) return;
  recentErrors.set(key, now);
  for (const [recentKey, timestamp] of recentErrors) {
    if (now - timestamp >= DEDUPE_WINDOW_MS) recentErrors.delete(recentKey);
  }
  reporter(error, safeContext);
}

export function __resetDedupeForTests(): void {
  recentErrors.clear();
}
