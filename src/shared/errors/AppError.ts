import { ERROR_MESSAGES, type ErrorCode } from './errorMessages';

export class AppError extends Error {
    readonly code: ErrorCode;

    constructor(code: ErrorCode) {
        super(ERROR_MESSAGES[code]);
        this.code = code;
        this.name = 'AppError';
    }
}
