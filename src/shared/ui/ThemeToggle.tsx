import { useTheme } from '@/shared/lib/hooks/useTheme';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
            {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>
    );
}
