import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruCommon from '@/locales/ru/common.json';
import enCommon from '@/locales/en/common.json';
import ruErrors from '@/locales/ru/errors.json';
import enErrors from '@/locales/en/errors.json';

const STORAGE_KEY = 'language';

function getSavedLanguage(): string {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
    return 'ru';
}

i18n.use(initReactI18next).init({
    resources: {
        ru: { common: ruCommon, errors: ruErrors },
        en: { common: enCommon, errors: enErrors },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
    localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
