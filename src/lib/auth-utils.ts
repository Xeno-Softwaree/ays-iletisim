import crypto from 'crypto';

/**
 * Generates a secure random token for password resets.
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a token using SHA-256 with the AUTH_SECRET as salt.
 */
export function hashToken(token: string): string {
    const secret = process.env.AUTH_SECRET || 'default_secret_for_dev_only';
    return crypto
        .createHash('sha256')
        .update(`${token}${secret}`)
        .digest('hex');
}
