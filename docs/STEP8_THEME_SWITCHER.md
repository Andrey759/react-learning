# Шаг 8. Переключатель темы (dark / light)

---

## 1. Проблема: `@media (prefers-color-scheme: dark)` — почему этого недостаточно?

До этого шага тёмная тема определялась так:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16171d;
    /* ... */
  }
}
```

Этот медиа-запрос **читает настройку ОС** (тёмная/светлая тема в системе).
Он **read-only** — JavaScript не может его переключить.

Если пользователь хочет светлую тему в приложении, но при этом у него в ОС стоит тёмная — он ничего не может сделать.

**Вывод:** для ручного переключения нужен другой механизм.

---

## 2. Решение: `data-theme` атрибут на `<html>`

Идея простая:

1. На элементе `<html>` устанавливаем атрибут `data-theme="light"` или `data-theme="dark"`.
2. В CSS используем селектор `[data-theme="dark"]` вместо `@media (prefers-color-scheme: dark)`.
3. JavaScript управляет значением атрибута — а значит, управляет темой.

### Было:

```css
@media (prefers-color-scheme: dark) {
  :root { --bg: #16171d; }
}
```

### Стало:

```css
[data-theme="dark"] {
  --bg: #16171d;
}
```

### Почему `[data-theme]` на `<html>`, а не CSS-класс?

Оба варианта работают. `data-theme` — это чуть более семантично: атрибут описывает *данные* (какая тема), а класс обычно описывает *стиль*. На практике — дело вкуса.

---

## 3. `color-scheme` — зачем это свойство?

```css
:root {
  color-scheme: light;
}
[data-theme="dark"] {
  color-scheme: dark;
}
```

`color-scheme` указывает браузеру, какой цветовой схеме соответствует страница. Это влияет на **нативные элементы**: скроллбары, `<input>`, `<select>`, `<textarea>`. Без этого свойства при тёмной теме нативные элементы ввода останутся светлыми.

---

## 4. Хук `useTheme` — логика переключения

**Файл:** `src/shared/lib/hooks/useTheme.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, toggleTheme } as const;
}
```

### Что здесь происходит — пошагово

| Шаг | Что делает | Зачем |
|-----|-----------|-------|
| `getInitialTheme()` | Читает `localStorage`. Если пусто — проверяет `matchMedia` (настройку ОС) | Приоритет: сохранённый выбор > настройка ОС |
| `useState(getInitialTheme)` | Инициализирует стейт **один раз** (передаём функцию, а не вызов) | Ленивая инициализация — `localStorage` не читается при каждом рендере |
| `useEffect` | При изменении `theme` ставит `data-theme` на `<html>` и сохраняет в `localStorage` | Синхронизация DOM и хранилища с React-стейтом |
| `toggleTheme` | Переключает `light` <-> `dark` | `useCallback` стабилизирует ссылку на функцию |

### Ленивая инициализация `useState`

```typescript
// Вызов при КАЖДОМ рендере (плохо):
const [theme, setTheme] = useState(getInitialTheme());

// Передача функции — вызов только при первом рендере (хорошо):
const [theme, setTheme] = useState(getInitialTheme);
```

Когда в `useState` передаётся **функция** (без скобок `()`), React вызовет её только один раз — при монтировании. Это называется **lazy initializer**. Полезно, когда начальное значение требует вычислений (чтение `localStorage`, `matchMedia` и т.д.).

---

## 5. Компонент `ThemeToggle`

**Файл:** `src/shared/ui/ThemeToggle.tsx`

```tsx
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
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
```

`aria-label` — для скринридеров (accessibility).

---

## 6. Приоритет определения темы

```
1. localStorage    → пользователь уже выбирал тему ранее?  → используем её
2. matchMedia      → OS/браузер в тёмном режиме?            → используем dark
3. по умолчанию    →                                         → light
```

---

## 7. `localStorage` — кратко

`localStorage` — простое key-value хранилище в браузере.

```typescript
localStorage.setItem('theme', 'dark');   // записать
localStorage.getItem('theme');            // прочитать → 'dark'
localStorage.removeItem('theme');         // удалить
```

- Данные хранятся **бессрочно** (пока пользователь не очистит).
- Доступны только на **том же домене**.
- Хранит только **строки**. Для объектов: `JSON.stringify` / `JSON.parse`.

---

## 8. Итого — что изменилось в проекте

| Файл | Что изменилось |
|------|---------------|
| `src/app/index.css` | `@media (prefers-color-scheme: dark)` заменён на `[data-theme="dark"]` |
| `src/app/App.css` | Все `@media (prefers-color-scheme: dark)` заменены на `[data-theme="dark"] .class` |
| `src/shared/lib/hooks/useTheme.ts` | Новый хук — логика темы + localStorage |
| `src/shared/ui/ThemeToggle.tsx` | Новый компонент — кнопка переключения |
| `src/app/App.tsx` | Добавлен `<ThemeToggle />` в хедер |
