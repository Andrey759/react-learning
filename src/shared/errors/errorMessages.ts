
export type ErrorCode = 'UNEXPECTED_FORMAT' | 'NETWORK_ERROR';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    UNEXPECTED_FORMAT: 'Неожиданный формат данных',
    NETWORK_ERROR: 'Не удалось загрузить данные',
};
