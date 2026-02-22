// src/lib/logger.ts

/**
 * A simple logger utility to replace `console.log` throughout the application.
 * In production, `.info()` and `.debug()` are suppressed to avoid leaking data or cluttering logs.
 * `.error()` and `.warn()` are passed through natively.
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
    info: (...args: any[]) => {
        if (!isProd) {
            console.log('[INFO]', ...args);
        }
    },
    debug: (...args: any[]) => {
        if (!isProd) {
            console.log('[DEBUG]', ...args);
        }
    },
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    }
};
