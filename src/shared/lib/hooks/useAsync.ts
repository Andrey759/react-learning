import { useState, useEffect, useRef } from 'react';
import { AppError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/shared/errors/errorMessages';
import { logger } from '@/shared/lib/logger.ts';

export function useAsync<T>(fn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fnRef = useRef(fn);
    fnRef.current = fn;

    useEffect(() => {
        fnRef.current()
            .then(setData)
            .catch(e => {
                logger.error('Async operation failed:', e);
                setError(e instanceof AppError ? e.message : ERROR_MESSAGES.NETWORK_ERROR);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { data, isLoading, error };
}
