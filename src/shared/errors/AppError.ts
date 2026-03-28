import { getErrorMessage, type ErrorCode } from './errorMessages';

export class AppError extends Error {
    readonly code: ErrorCode;

    constructor(code: ErrorCode) {
        super(getErrorMessage(code));
        this.code = code;
        this.name = 'AppError';
    }
}
