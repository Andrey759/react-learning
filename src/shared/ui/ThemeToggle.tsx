import { useTheme } from '@/shared/lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation('common');

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
