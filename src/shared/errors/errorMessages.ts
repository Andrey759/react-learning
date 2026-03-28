import i18n from '@/i18n';

export type ErrorCode = 'UNEXPECTED_FORMAT' | 'NETWORK_ERROR' | 'AUTHENTICATION_ERROR';

export function getErrorMessage(code: ErrorCode): string {
    return i18n.t(code, { ns: 'errors' });
}
