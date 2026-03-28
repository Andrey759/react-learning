import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    return (
        <div className="lang-switcher">
            <button
                type="button"
                className={`lang-switcher__btn ${i18n.language === 'ru' ? 'lang-switcher__btn--active' : ''}`}
                onClick={() => i18n.changeLanguage('ru')}
            >
                🇷🇺
            </button>
            <button
                type="button"
                className={`lang-switcher__btn ${i18n.language === 'en' ? 'lang-switcher__btn--active' : ''}`}
                onClick={() => i18n.changeLanguage('en')}
            >
                🇬🇧
            </button>
        </div>
    );
}
