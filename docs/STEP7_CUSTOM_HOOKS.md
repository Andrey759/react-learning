# Шаг 7. Кастомные хуки: `useAsync` и `useTasks`

---

## 1. Кастомный хук vs обычная функция — в чём разница?

Короткий ответ: **кастомный хук — это и есть обычная функция.** Никакой магии в нём нет.
Но есть одно ключевое свойство, которое делает его «хуком», а не просто утилитой:

> **Кастомный хук — это функция, которая внутри себя вызывает другие хуки React** (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`, другие кастомные хуки и т.д.).

### Почему это важно?

Хуки React работают по строгим правилам:
- их можно вызывать **только** внутри React-компонента или внутри другого хука;
- их **нельзя** вызывать в обычных функциях, в условиях (`if`), циклах и т.д.

Вот чисто практическое разграничение:

| | Обычная функция | Кастомный хук |
|---|---|---|
| Пример из твоего проекта | `fetchUsers()` — просто делает `fetch` и возвращает данные | `useTaskFilter()` — внутри использует `useContext` |
| Использует хуки React внутри? | Нет | Да |
| Именование | любое: `fetchUsers`, `formatDate` | **обязательно** начинается с `use`: `useAsync`, `useTasks` |
| Где можно вызвать? | Где угодно | Только внутри компонента или другого хука |
| Имеет своё «состояние»? | Нет — это чистая функция | Да — каждый вызов хука «привязан» к конкретному экземпляру компонента |

Префикс `use` — это не просто конвенция для красоты. React-линтер (`eslint-plugin-react-hooks`) по этому префиксу определяет, что функция является хуком, и проверяет, что ты соблюдаешь правила вызова хуков. Если назвать хук `getTasks()` вместо `useTasks()`, линтер не поймёт, что это хук, и не предупредит об ошибках.

---

## 2. Хук `useAsync<T>` — универсальная загрузка данных

### Зачем он нужен?

Посмотри на свой `UserPage`:

```typescript
// Вот эти 10 строк повторяются в каждой странице, которая грузит данные:
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    fetchUsers()
        .then(setUsers)
        .catch(e => setError(e instanceof AppError ? e.message : ERROR_MESSAGES.NETWORK_ERROR))
        .finally(() => setIsLoading(false));
}, []);
```

А теперь посмотри на `TasksPage` — там ровно тот же паттерн:

```typescript
const [tasks, setTasks] = useState<UserTask[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>();

useEffect(() => {
    fetchTasks()
        .then(setTasks)
        .catch(e => setError(e instanceof AppError ? e.message : ERROR_MESSAGES.NETWORK_ERROR))
        .finally(() => setIsLoading(false));
}, []);
```

Это **дублирование**. Идея `useAsync` — вынести этот повторяющийся паттерн в одно место.

### Что должен делать `useAsync`

Хук принимает асинхронную функцию и возвращает объект с тремя полями: данные, флаг загрузки и ошибку.

Вот его сигнатура:

```typescript
function useAsync<T>(fn: () => Promise<T>): {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}
```

### Как он работает внутри — пошагово

Хук должен сделать ровно то, что ты уже делаешь руками в каждой странице:

1. **Объявить три состояния** — `data`, `isLoading`, `error` — через `useState`.
2. **В `useEffect`** вызвать переданную функцию `fn()`.
3. При успехе — записать результат в `data`.
4. При ошибке — записать текст ошибки в `error`.
5. В `finally` — снять флаг `isLoading`.
6. **Вернуть** объект `{ data, isLoading, error }`.

Вот скелет (с пропусками, которые нужно заполнить):

```typescript
import { useState, useEffect } from 'react';
import { AppError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/shared/errors/errorMessages';

function useAsync<T>(fn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    // ... ещё два useState для isLoading и error ...

    useEffect(() => {
        fn()
            .then(/* ... */)
            .catch(/* ... */)
            .finally(/* ... */);
    }, []);
    //  ^^^ пустой массив зависимостей — эффект сработает один раз при монтировании

    return { data, isLoading, error };
}
```

### Важный момент: массив зависимостей `useEffect`

Массив зависимостей `[]` означает: «выполни эффект один раз, при монтировании компонента». Это то, что тебе нужно для загрузки данных.

Но есть подвох: линтер может ругаться, что `fn` не включена в массив зависимостей. Это правильное предупреждение — если `fn` будет пересоздаваться при каждом рендере (а **обычная стрелочная функция, переданная как аргумент, пересоздаётся каждый раз**), эффект будет срабатывать снова и снова.

Решение — **стабилизировать ссылку** на `fn`. Здесь есть два подхода:

**Подход A.** Вызывающая сторона оборачивает функцию в `useCallback`:

```typescript
// В компоненте:
const loadUsers = useCallback(() => fetchUsers(), []);
const { data, isLoading, error } = useAsync(loadUsers);
```

Это работает, но заставляет каждого потребителя хука думать о стабильности ссылки.

**Подход B.** Внутри `useAsync` сохранять последнюю версию `fn` через `useRef`, чтобы эффект не зависел от ссылки на функцию:

```typescript
const fnRef = useRef(fn);
fnRef.current = fn;

useEffect(() => {
    fnRef.current()
        .then(/* ... */)
        .catch(/* ... */)
        .finally(/* ... */);
}, []);
```

`useRef` не вызывает ререндер при изменении `.current`, поэтому `useEffect` не перезапустится. Но при этом `fnRef.current` всегда указывает на актуальную версию функции. Это стандартный приём в React — называется **«свежая ссылка через ref»**.

Выбери подход, который тебе покажется понятнее. Подход B удобнее для потребителя (не надо думать о `useCallback`), но чуть сложнее внутри.

### Как `UserPage` будет выглядеть после рефакторинга

```typescript
function UserPage() {
    const { data: users, isLoading, error } = useAsync(fetchUsers);

    // Дальше — только рендер. Никаких useState/useEffect для загрузки.
    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className="dashboard">
            {/* ... рендер users ... */}
        </div>
    );
}
```

Десять строк превратились в одну.

### Где разместить файл

По архитектуре проекта — `useAsync` является **общей переиспользуемой утилитой**, не привязанной к конкретной сущности. Поэтому:

```
src/shared/lib/hooks/useAsync.ts
```

---

## 3. Хук `useTasks` — инкапсуляция логики задач

### Зачем он нужен?

`useAsync` решает проблему загрузки, но в `TasksPage` есть ещё специфичная логика:
- `loadingIds` — множество ID задач, которые сейчас обновляются;
- `toggleTask` — функция переключения статуса задачи, обёрнутая в `useCallback`.

Эта логика **специфична для задач** (а не универсальна), поэтому для неё нужен свой хук — `useTasks`.

### Что должен делать `useTasks`

```typescript
function useTasks(): {
    tasks: UserTask[];
    isLoading: boolean;
    error: string | null;
    loadingIds: Set<number>;
    toggleTask: (id: number, completed: boolean) => void;
}
```

### Как он работает внутри

1. **Использует `useAsync`** для загрузки задач:
   ```typescript
   const { data, isLoading, error } = useAsync(fetchTasks);
   ```

2. **Хранит `tasks` в отдельном `useState`**, потому что задачи могут меняться локально (при `toggleTask`):
   ```typescript
   const [tasks, setTasks] = useState<UserTask[]>([]);
   ```

3. **Синхронизирует `data` из `useAsync` с `tasks`** через `useEffect`:
   ```typescript
   useEffect(() => {
       if (data) setTasks(data);
   }, [data]);
   ```
   Зачем? `useAsync` возвращает данные «как есть» из API. Но нам нужна **мутабельная копия**, которую мы будем обновлять при toggle. Поэтому при получении данных мы копируем их в свой стейт.

4. **Хранит `loadingIds`** — `useState<Set<number>>`.

5. **Определяет `toggleTask`** — через `useCallback`, точно как у тебя сейчас в `TasksPage`.

6. **Возвращает** всё это наружу.

### Скелет (с пропусками):

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { UserTask } from '@/entities/task/model/types';
import { fetchTasks, updateTaskStatus } from '@/entities/task/api/taskApi';
import { useAsync } from '@/shared/lib/hooks/useAsync';

function useTasks() {
    const { data, isLoading, error } = useAsync(fetchTasks);

    const [tasks, setTasks] = useState<UserTask[]>([]);
    // ... loadingIds ...

    useEffect(() => {
        // когда data придёт из useAsync — скопировать в tasks
    }, [/* ... */]);

    const toggleTask = useCallback((id: number, completed: boolean) => {
        // ... то же, что у тебя сейчас в TasksPage ...
    }, []);

    return { tasks, isLoading, error, loadingIds, toggleTask };
}
```

### Как `TasksPage` будет выглядеть после рефакторинга

```typescript
function TasksPage() {
    const { tasks, isLoading, error, loadingIds, toggleTask } = useTasks();
    const { filterText, setFilterText, activeTab, setActiveTab } = useTaskFilter();

    // filteredTasks через useMemo — остаётся здесь, потому что зависит от filterText и activeTab

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        // ... чистый рендер, никакой логики загрузки и toggle ...
    );
}
```

Страница стала **почти чисто отображающей** — вся бизнес-логика спрятана в хуках.

### Где разместить файл

`useTasks` привязан к сущности `task`, поэтому:

```
src/entities/task/hooks/useTasks.ts
```

---

## 4. Чеклист реализации

### Шаг A: `useAsync`
- [ ] Создать файл `src/shared/lib/hooks/useAsync.ts`
- [ ] Реализовать хук с тремя `useState` и одним `useEffect`
- [ ] Решить проблему стабильности ссылки на `fn` (подход A или B — см. выше)
- [ ] Экспортировать хук

### Шаг B: Рефакторинг `UserPage`
- [ ] Заменить ручные `useState` + `useEffect` на вызов `useAsync(fetchUsers)`
- [ ] Убедиться, что страница работает как раньше

### Шаг C: `useTasks`
- [ ] Создать файл `src/entities/task/hooks/useTasks.ts`
- [ ] Внутри вызвать `useAsync(fetchTasks)`
- [ ] Добавить `useState` для `tasks` и `loadingIds`
- [ ] Добавить `useEffect` для синхронизации `data → tasks`
- [ ] Перенести `toggleTask` из `TasksPage`
- [ ] Экспортировать хук

### Шаг D: Рефакторинг `TasksPage`
- [ ] Заменить всю логику загрузки и toggle на `useTasks()`
- [ ] Оставить `useMemo` для фильтрации — он относится к отображению, а не к данным
- [ ] Убедиться, что всё работает как раньше

---

## 5. Главное, что нужно усвоить

1. **Кастомный хук = обычная функция + вызов хуков React внутри.** Ничего больше.

2. **Хук — не синглтон.** Каждый вызов `useAsync(fetchUsers)` создаёт **отдельный** набор `useState`/`useEffect`, привязанный к конкретному компоненту. Если ты вызовешь `useAsync` в двух разных компонентах, у каждого будет своё независимое состояние. Это как `new ArrayList<>()` — каждый вызов создаёт отдельный экземпляр.

3. **Композиция хуков** — главная сила: `useTasks` вызывает `useAsync`, который вызывает `useState` и `useEffect`. Хуки собираются как кубики Lego.

4. **Хуки выносят логику, а не UI.** Компонент после рефакторинга содержит только JSX (отображение), а вся работа с данными — в хуках. Это разделение обязанностей, аналог MVC/MVP, где хук — это «контроллер», а компонент — «представление».
