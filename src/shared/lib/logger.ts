type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel: LogLevel =
    (import.meta.env.VITE_LOG_LEVEL as LogLevel) ?? 'debug';

function isEnabled(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

export const logger = {
    debug(...args: unknown[]) {
        if (isEnabled('debug')) console.debug('[DEBUG]', ...args);
    },
    info(...args: unknown[]) {
        if (isEnabled('info')) console.info('[INFO]', ...args);
    },
    warn(...args: unknown[]) {
        if (isEnabled('warn')) console.warn('[WARN]', ...args);
    },
    error(...args: unknown[]) {
        if (isEnabled('error')) console.error('[ERROR]', ...args);
    },
};
