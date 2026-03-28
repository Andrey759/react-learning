# Ответы на вопросы — Middle React Developer

---

## JavaScript (продвинутый уровень)

### Язык и рантайм

### 1. Как работает движок JavaScript (V8)? Что такое JIT-компиляция?

V8 — это движок JavaScript, разработанный Google и используемый в Chrome и Node.js. Когда код попадает в V8, он проходит несколько этапов. Сначала исходный код разбирается парсером в AST (Abstract Syntax Tree). Затем интерпретатор **Ignition** преобразует AST в байт-код и начинает его выполнять. Во время выполнения V8 собирает профилирующую информацию — какие функции вызываются часто, какие типы аргументов передаются.

Когда функция определяется как «горячая» (вызывается многократно), в дело вступает оптимизирующий компилятор **TurboFan**. Он берёт байт-код и профилирующие данные, а затем генерирует высокооптимизированный машинный код. Это и есть **JIT-компиляция** (Just-In-Time) — компиляция происходит прямо во время выполнения программы, а не заранее.

Если предположения оптимизатора нарушаются (например, функция вдруг получила аргумент другого типа), происходит **деоптимизация** — откат к байт-коду Ignition.

```js
// Мономорфный вызов — V8 оптимизирует эффективно
function add(a, b) {
  return a + b;
}
add(1, 2);     // number + number
add(3, 4);     // number + number — тот же тип, TurboFan доволен

// Полиморфный вызов — может вызвать деоптимизацию
add(1, 2);       // number + number
add("a", "b");   // string + string — другой тип!
```

---

### 2. Что такое Execution Context и Call Stack?

**Execution Context** (контекст выполнения) — это абстрактное понятие, описывающее окружение, в котором выполняется код. Каждый контекст содержит: **Variable Environment**, **Lexical Environment**, ссылку на внешнее лексическое окружение и значение **this**.

Существует три типа контекстов: **глобальный** (создаётся при запуске программы), **функциональный** (создаётся при каждом вызове функции) и **eval**.

**Call Stack** (стек вызовов) — это структура данных LIFO (Last In, First Out), которая хранит контексты выполнения. Когда вызывается функция, её контекст помещается на вершину стека. Когда функция возвращает результат, контекст извлекается из стека.

```js
function third() {
  // Call Stack: [Global, first, second, third]
  console.trace();
}
function second() { third(); }
function first() { second(); }

first();
```

---

### 3. Как устроена память в JavaScript? Что такое Stack и Heap?

**Stack** — быстрая, упорядоченная область памяти фиксированного размера. Здесь хранятся примитивные значения и ссылки на объекты. **Heap** — большая, неупорядоченная область для хранения объектов, массивов, функций. Когда вы создаёте объект, он размещается в куче, а в стеке сохраняется лишь ссылка.

```js
// Примитивы — хранятся в Stack (копируются по значению)
let a = 10;
let b = a;
b = 20;
console.log(a); // 10

// Объекты — хранятся в Heap (копируется ссылка)
let obj1 = { name: "Alice" };
let obj2 = obj1;
obj2.name = "Bob";
console.log(obj1.name); // "Bob" — один объект, две ссылки
```

---

### 4. Что такое Garbage Collection? Какие алгоритмы сборки мусора вы знаете?

**Garbage Collection** — автоматический процесс освобождения памяти, которая больше не используется. Основной алгоритм — **Mark-and-Sweep**: GC начинает с «корней» (глобальный объект, стек вызовов), рекурсивно помечает все достижимые объекты, а непомеченные удаляет.

V8 использует **поколенческий** подход: **Young Generation** (новые объекты, собирается часто алгоритмом Scavenge) и **Old Generation** (долгоживущие, собирается реже через Mark-Sweep/Mark-Compact).

```js
let user = { name: "Alice" };
user = null; // объект теперь недоступен и будет собран GC
```

---

### 5. Что такое утечки памяти (memory leaks)? Приведите примеры и способы предотвращения.

Утечка памяти — это ситуация, когда объекты, которые больше не нужны, продолжают занимать память из-за оставшихся ссылок. Основные причины:

1. **Забытые таймеры и подписки** — `setInterval`, слушатели событий, которые не очищаются.
2. **Замыкания, удерживающие ссылки** на большие объекты.
3. **Глобальные переменные** — случайное присвоение без `let`/`const`.
4. **Отсоединённые DOM-узлы** — элемент удалён из DOM, но JS хранит ссылку.
5. **Кэши без ограничений**.

```js
// Утечка: забытый слушатель
window.addEventListener("scroll", this.handleScroll);
// Предотвращение: очистка в cleanup
window.removeEventListener("scroll", this.handleScroll);

// Предотвращение: использование WeakMap для кэша
const cache = new WeakMap();
function getCachedData(obj) {
  if (!cache.has(obj)) cache.set(obj, expensiveComputation(obj));
  return cache.get(obj);
}
```

---

### 6. Что такое Event Loop в деталях? Объясните порядок выполнения microtasks, macrotasks и requestAnimationFrame.

Event Loop постоянно проверяет стек вызовов и очереди задач. Порядок в каждой итерации:

1. Берётся одна **macrotask** (setTimeout, setInterval, события DOM).
2. Полностью опустошается **очередь microtasks** (Promise .then, queueMicrotask, MutationObserver).
3. Если наступил момент перерисовки — выполняются колбэки **requestAnimationFrame**.
4. Браузер выполняет Layout, Paint, Composite.

```js
console.log("1: sync");
setTimeout(() => console.log("2: macrotask"), 0);
Promise.resolve().then(() => console.log("3: microtask"));
queueMicrotask(() => console.log("4: microtask"));
requestAnimationFrame(() => console.log("5: rAF"));
console.log("6: sync");

// Вывод: 1, 6, 3, 4, 5, 2
```

---

### 7. Чем отличается queueMicrotask от setTimeout(..., 0)?

`queueMicrotask` добавляет в очередь **микрозадач** (выполняется сразу после текущего синхронного кода, до перерисовки). `setTimeout(..., 0)` — в очередь **макрозадач** (выполняется в следующей итерации Event Loop, после микрозадач и перерисовки). Также `setTimeout` имеет минимальную задержку ~4 мс.

```js
console.log("start");
setTimeout(() => console.log("setTimeout"), 0);
queueMicrotask(() => console.log("queueMicrotask"));
console.log("end");
// start, end, queueMicrotask, setTimeout
```

---

### Замыкания и область видимости

### 8. Объясните лексическое окружение (Lexical Environment) и цепочку областей видимости (Scope Chain).

**Lexical Environment** состоит из **Environment Record** (привязки переменных) и **ссылки на внешнее лексическое окружение** (outer reference). **Scope Chain** образуется из связанных окружений через outer-ссылки. При поиске переменной движок идёт от текущего окружения вверх по цепочке до глобального.

```js
const global = "глобальная";
function outer() {
  const outerVar = "из outer";
  function inner() {
    const innerVar = "из inner";
    console.log(innerVar);  // inner LexEnv
    console.log(outerVar);  // outer LexEnv
    console.log(global);    // global LexEnv
  }
  inner();
}
```

---

### 9. Как замыкания используются для реализации приватных переменных?

Замыкание «помнит» своё лексическое окружение. Внешняя функция объявляет переменные и возвращает объект с методами, имеющими доступ к ним через замыкание. Извне к переменным нет прямого доступа.

```js
function createCounter(initialValue = 0) {
  let count = initialValue;
  return {
    increment() { count++; },
    decrement() { count--; },
    getCount() { return count; },
  };
}
const counter = createCounter(10);
counter.increment();
console.log(counter.getCount()); // 11
console.log(counter.count);      // undefined — приватно
```

---

### 10. Что такое каррирование (currying) и частичное применение (partial application)?

**Каррирование** — трансформация `f(a, b, c)` в `f(a)(b)(c)`. **Частичное применение** — фиксация одного или нескольких аргументов с получением новой функции.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6

function partial(fn, ...fixedArgs) {
  return (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);
}
const addTen = partial(add, 10);
console.log(addTen(2, 3)); // 15
```

---

### Прототипы и метапрограммирование

### 11. Как работает цепочка прототипов? Что произойдёт при обращении к несуществующему свойству?

Каждый объект имеет `[[Prototype]]`, ссылающийся на прототип. При обращении к свойству движок ищет его в самом объекте, затем в прототипе, затем в прототипе прототипа — вплоть до `Object.prototype` (чей прототип — `null`). Если не найдено нигде — возвращается `undefined`.

```js
const animal = { eat() { return "ест"; } };
const dog = Object.create(animal);
dog.bark = function () { return "гав!"; };
const myDog = Object.create(dog);
myDog.name = "Шарик";

console.log(myDog.bark()); // "гав!" — из dog
console.log(myDog.eat());  // "ест" — из animal
console.log(myDog.fly);    // undefined — нет в цепочке
```

---

### 12. Что такое Proxy и Reflect? Приведите примеры использования.

**Proxy** — объект-обёртка, позволяющий перехватывать операции над объектом (чтение, запись, вызов). **Reflect** — встроенный объект для вызова поведения по умолчанию в ловушках Proxy.

```js
const user = { name: "Alice", age: 25 };

const validatedUser = new Proxy(user, {
  set(target, prop, value, receiver) {
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("Возраст должен быть положительным числом");
    }
    return Reflect.set(target, prop, value, receiver);
  },
  get(target, prop, receiver) {
    console.log(`Чтение: ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
});

validatedUser.age = 30;   // OK
// validatedUser.age = -5; // TypeError!
```

---

### 13. Что такое дескрипторы свойств (property descriptors)?

Каждое свойство имеет атрибуты: **Data descriptor** (`value`, `writable`, `enumerable`, `configurable`) или **Accessor descriptor** (`get`, `set`, `enumerable`, `configurable`). `Object.defineProperty` создаёт/изменяет свойство с контролем над атрибутами.

```js
const person = {};
Object.defineProperty(person, "name", {
  value: "Alice",
  writable: false,
  enumerable: true,
  configurable: false,
});
person.name = "Bob"; // В strict mode — TypeError
console.log(person.name); // "Alice"
```

---

### 14. Что такое WeakMap и WeakRef? Когда их использовать?

**WeakMap** — коллекция «ключ-значение», где ключи — только объекты, и ссылки слабые (не препятствуют сборке мусора). **WeakRef** — слабая ссылка на объект; `deref()` возвращает объект или `undefined`, если он собран GC.

```js
const privateData = new WeakMap();
class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }
  checkPassword(input) {
    return privateData.get(this).password === input;
  }
}
let user = new User("Alice", "secret");
user = null; // запись из WeakMap удалится автоматически
```

---

### Асинхронность (продвинутый уровень)

### 15. Как реализовать паттерн отмены запросов (AbortController)?

`AbortController` создаёт `AbortSignal`, который передаётся в `fetch`. Вызов `controller.abort()` прерывает запрос с ошибкой `AbortError`.

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        signal: controller.signal,
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.name !== "AbortError") setError(err);
    }
  }

  fetchData();
  return () => controller.abort();
}, [userId]);
```

---

### 16. Что такое генераторы (generators) и итераторы (iterators)?

**Итератор** — объект с методом `next()`, возвращающим `{ value, done }`. **Генератор** — функция (`function*`), которая может приостанавливать выполнение (`yield`) и возобновляться.

```js
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
```

---

### 17. Что такое for await...of? Когда его использовать?

`for await...of` итерирует по **асинхронным итерируемым** объектам. Используется, когда данные приходят порциями с задержкой: потоки данных, постраничная загрузка.

```js
async function* fetchPages(baseUrl) {
  let page = 1;
  while (true) {
    const res = await fetch(`${baseUrl}?page=${page}`);
    const data = await res.json();
    if (data.items.length === 0) return;
    yield data.items;
    page++;
  }
}

for await (const users of fetchPages("/api/users")) {
  users.forEach((u) => console.log(u.name));
}
```

---

### 18. Как реализовать debounce и throttle? В чём разница?

**Debounce** — выполняет функцию после паузы в вызовах (поиск по мере ввода). **Throttle** — ограничивает частоту вызовов (обработка скролла).

```js
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

---

### 19. Что такое Web Workers? Когда их стоит использовать?

**Web Workers** запускают JavaScript в отдельном фоновом потоке, не блокируя UI. Worker не имеет доступа к DOM. Общение через `postMessage`/`onmessage`.

```js
// main.js
const worker = new Worker("worker.js");
worker.postMessage({ numbers: [5, 3, 8, 1] });
worker.onmessage = (e) => console.log("Отсортировано:", e.data.sorted);

// worker.js
self.onmessage = (e) => {
  const sorted = e.data.numbers.sort((a, b) => a - b);
  self.postMessage({ sorted });
};
```

Использовать для: парсинг больших JSON, обработка изображений, криптография, сортировка больших массивов.

---

### Функциональное программирование

### 20. Что такое иммутабельность? Почему она важна в React?

Иммутабельность — принцип, при котором данные не изменяются, а создаётся новая копия. В React это критично: React сравнивает состояние по ссылке (`===`). Мутация объекта не изменяет ссылку → React не увидит изменения.

```jsx
// НЕПРАВИЛЬНО
user.age += 1;
setUser(user); // ссылка та же — нет ререндера

// ПРАВИЛЬНО
setUser((prev) => ({ ...prev, age: prev.age + 1 })); // новый объект
```

---

### 21. Что такое композиция функций (function composition)?

Композиция — объединение нескольких функций в одну, где результат одной передаётся как аргумент следующей: `(f ∘ g)(x) = f(g(x))`.

```js
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const processWords = pipe(
  (str) => str.trim(),
  (str) => str.toLowerCase(),
  (str) => str.split(" "),
  (words) => words.filter((w) => w.length > 3)
);

console.log(processWords("  Hello Beautiful World  "));
// ["hello", "beautiful", "world"]
```

---

### 22. Что такое функторы и монады? (базовое понимание)

**Функтор** — контейнер с операцией `map`: применяет функцию к значению внутри и возвращает новый контейнер. Массив — функтор. **Монада** — функтор с `flatMap`: применяет функцию, возвращающую контейнер, и «разворачивает» один уровень вложенности. Promise близок к монаде: `.then()` автоматически разворачивает вложенный Promise.

```js
// Maybe-монада — безопасная работа с null/undefined
class Maybe {
  constructor(value) { this._value = value; }
  static of(value) { return new Maybe(value); }
  map(fn) { return this._value == null ? this : Maybe.of(fn(this._value)); }
  getOrElse(def) { return this._value ?? def; }
}

const street = Maybe.of(user)
  .map((u) => u.address)
  .map((a) => a.street)
  .map((s) => s.name)
  .getOrElse("Неизвестно");
```

---

### 23. Что такое мемоизация? Как её реализовать?

Мемоизация — кэширование результата функции на основе аргументов. При повторном вызове с теми же аргументами возвращается кэш.

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const factorial = memoize((n) => (n <= 1 ? 1 : n * factorial(n - 1)));
factorial(5); // вычисляет
factorial(5); // из кэша
```

---

## TypeScript (продвинутый уровень)

### 24. Что такое Utility Types?

Встроенные generic-типы для трансформации существующих типов:

```tsx
interface User { id: number; name: string; email: string; age?: number; }

type UserUpdate = Partial<User>;          // все поля необязательные
type StrictUser = Required<User>;         // все обязательные
type Credentials = Pick<User, "email" | "name">;
type WithoutId = Omit<User, "id">;
type UserMap = Record<string, User>;

type Status = "active" | "inactive" | "banned";
type ActiveStatus = Exclude<Status, "banned">; // "active" | "inactive"
type OnlyBanned = Extract<Status, "banned">;   // "banned"

type Ret = ReturnType<typeof createUser>;
```

---

### 25. Что такое Conditional Types? Как работает infer?

Conditional Types выбирают тип по условию: `T extends U ? X : Y`. **infer** извлекает часть типа внутри условного типа.

```tsx
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type R1 = GetReturnType<() => string>; // string

type ElementOf<T> = T extends (infer E)[] ? E : T;
type E1 = ElementOf<string[]>; // string

type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
type P1 = Awaited<Promise<Promise<number>>>; // number
```

---

### 26. Как создавать собственные generic-типы?

```tsx
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type HasId = { id: number | string };

function updateEntity<T extends HasId>(
  entity: T,
  updates: Partial<Omit<T, "id">>
): T {
  return { ...entity, ...updates };
}

type Paginated<T, Meta = { totalPages: number }> = {
  items: T[];
  page: number;
  meta: Meta;
};
```

---

### 27. Что такое type narrowing и type guards?

Type narrowing — уточнение типа в ветке кода через проверки. Type guards — выражения, выполняющие проверку типа в рантайме.

```tsx
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as ApiError).code === "number"
  );
}

try { /* ... */ } catch (error) {
  if (isApiError(error)) {
    console.log(`Ошибка ${error.code}: ${error.message}`);
  }
}
```

---

### 28. Что такое discriminated unions (размеченные объединения)?

Каждый член union-типа имеет общее литеральное свойство (дискриминант), по которому TypeScript определяет конкретный тип.

```tsx
type Shape =
  | { type: "circle"; radius: number }
  | { type: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

### 29. Что такое declaration merging?

Механизм TypeScript, при котором несколько деклараций с одним именем объединяются. Работает для **интерфейсов** (не для type).

```tsx
interface User { id: number; name: string; }
interface User { email: string; }
// Результат: { id: number; name: string; email: string; }

// Расширение сторонних библиотек
declare module "react" {
  interface CSSProperties {
    "--custom-color"?: string;
  }
}
```

---

### 30. Как типизировать HOC и render props?

```tsx
// HOC
function withLoading<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithLoadingComponent: React.FC<P & { isLoading: boolean }> = ({
    isLoading, ...props
  }) => {
    if (isLoading) return <div>Загрузка...</div>;
    return <WrappedComponent {...(props as P)} />;
  };
  return WithLoadingComponent;
}

// Render Props
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch(url).then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, [url]);
  return <>{children(data, loading)}</>;
}
```

---

### 31. Что такое satisfies оператор в TypeScript?

`satisfies` проверяет совместимость с типом, **не расширяя** выведенный тип переменной.

```tsx
type Theme = Record<string, string | [number, number, number]>;

const palette = {
  primary: "red",
  secondary: [0, 128, 255],
} satisfies Theme;

palette.primary.toUpperCase(); // OK — TypeScript знает, что это строка
palette.secondary[0];          // OK — TypeScript знает, что это массив
```

---

### 32. Что такое as const и const assertions?

`as const` делает все значения максимально узкими и `readonly`.

```tsx
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "editor" | "viewer"

const config = { api: "https://api.com", timeout: 5000 } as const;
// config.api: "https://api.com" (литеральный тип, а не string)
```

---

### 33. Как работает keyof и typeof в TypeScript?

`keyof` — union-тип всех ключей объектного типа. `typeof` — получение типа из значения. `keyof typeof` — ключи объекта-значения.

```tsx
interface User { id: number; name: string; email: string; }
type UserKey = keyof User; // "id" | "name" | "email"

const STATUS = { IDLE: "idle", LOADING: "loading" } as const;
type StatusValue = (typeof STATUS)[keyof typeof STATUS]; // "idle" | "loading"

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

## React (продвинутый уровень)

### Архитектура и рендеринг

### 34. Как работает Virtual DOM в деталях? Опишите алгоритм diffing.

Virtual DOM — легковесное представление реального DOM в виде JS-объектов. Алгоритм diffing:

1. **Сравнение по типу** — разные типы → полная замена поддерева.
2. **Сравнение атрибутов** — тот же тип → обновляются только изменившиеся props.
3. **Рекурсивный обход детей** — используются `key` для сопоставления элементов.

Сложность — **O(n)** благодаря двум эвристикам: сравнение по типу и использование ключей.

---

### 35. Что такое React Fiber? Как он улучшает рендеринг?

React Fiber — внутренняя архитектура React 16+. Каждый Fiber-узел — единица работы с полями `child`, `sibling`, `return`. Ключевое улучшение — **инкрементальный рендеринг**: работа разбивается на мелкие единицы, которые можно прервать, приостановить и возобновить. Две фазы: **render** (чистая, может быть прервана) и **commit** (синхронная, применяет изменения к DOM). Fiber — основа для Concurrent Mode и Suspense.

---

### 36. Что такое Concurrent Mode (конкурентный режим)?

Набор возможностей React 18+, позволяющих прерывать рендеринг и работать над обновлениями с разными приоритетами. Включается через `createRoot`. Позволяет приостановить тяжёлый рендеринг ради обработки пользовательского ввода. Основные API: `useTransition`, `useDeferredValue`, `Suspense`.

---

### 37. Как работает батчинг (batching) обновлений состояния в React 18?

React 18 ввёл **автоматический батчинг** — несколько обновлений состояния объединяются в один ре-рендер, **независимо от контекста** (setTimeout, промисы, нативные события). Для принудительного рендера без батчинга используется `flushSync`.

```jsx
// React 18 — один ре-рендер
setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
}, 1000);
```

---

### 38. Что такое приоритеты обновлений в React?

React разделяет обновления по приоритетам (Lanes): **SyncLane** (клики, ввод) → **InputContinuousLane** (drag, scroll) → **DefaultLane** (useEffect) → **TransitionLane** (startTransition) → **IdleLane**. Разработчик влияет через `useTransition` и `useDeferredValue`.

---

### 39. Что вызывает лишние ре-рендеры? Как их находить и устранять?

Причины: обновление родителя, новые ссылки на объекты/функции при каждом рендере, изменение контекста. Инструменты: React DevTools Profiler, `why-did-you-render`. Решения: `React.memo`, `useMemo`, `useCallback`, вынос состояния в отдельный компонент (изоляция).

```jsx
// Изоляция состояния
function SearchInput() {
  const [text, setText] = useState("");
  return <input value={text} onChange={(e) => setText(e.target.value)} />;
}
function Page() {
  return (
    <div>
      <SearchInput />
      <HeavyComponent /> {/* не ре-рендерится */}
    </div>
  );
}
```

---

### 40. Как работает React DevTools Profiler?

Записывает информацию о каждом коммите. Показывает: **Flamegraph** (иерархия с цветовой индикацией), **Ranked chart** (самые медленные вверху), **Why did this render?** (причина ре-рендера). Программный вариант:

```jsx
<Profiler id="Nav" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) console.warn(`${id}: ${actualDuration}ms`);
}}>
  <Navigation />
</Profiler>
```

---

### Хуки (продвинутый уровень)

### 41. Как работает useReducer? Когда использовать вместо useState?

`useReducer` — управление состоянием через редьюсер (чистая функция `(state, action) => newState`). Использовать, когда: сложный объект с множеством полей, обновления зависят от типа действия, нужна предсказуемость. `dispatch` стабилен между рендерами.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + state.step };
    case "setStep": return { ...state, step: action.payload };
    default: throw new Error(`Unknown: ${action.type}`);
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
```

---

### 42. Как создать кастомный хук? Приведите примеры.

Функция, начинающаяся с `use`, вызывающая другие хуки. Извлекает повторяющуюся логику.

```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const set = useCallback((newValue) => {
    setValue((prev) => {
      const val = typeof newValue === "function" ? newValue(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(val));
      return val;
    });
  }, [key]);
  return [value, set];
}
```

---

### 43. Что такое useId?

Хук React 18, генерирующий уникальный стабильный id, одинаковый на сервере и клиенте. Для `htmlFor`/`id`, ARIA-атрибутов.

```jsx
function FormField({ label }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

---

### 44. Что такое useDeferredValue и useTransition?

**useTransition** — помечает обновление setState как низкоприоритетное. **useDeferredValue** — откладывает обновление значения. Разница: `useTransition` оборачивает setState, `useDeferredValue` откладывает само значение.

```jsx
const [isPending, startTransition] = useTransition();
function handleChange(e) {
  setQuery(e.target.value);
  startTransition(() => { setResults(filterHugeList(e.target.value)); });
}
```

---

### 45. Что такое useSyncExternalStore?

Хук для подписки на **внешние хранилища** (не React). Гарантирует корректное чтение в concurrent-режиме.

```jsx
function useWindowWidth() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener("resize", cb); return () => window.removeEventListener("resize", cb); },
    () => window.innerWidth,
    () => 1024
  );
}
```

---

### 46. Как работает useImperativeHandle?

Настраивает значение ref, предоставляя родителю ограниченный императивный API.

```jsx
const CustomInput = forwardRef(function CustomInput(props, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
  }), []);
  return <input ref={inputRef} {...props} />;
});
```

---

### 47. Как правильно обрабатывать race conditions в useEffect?

Используйте **AbortController** — отменяет запрос на сетевом уровне при смене зависимостей:

```jsx
useEffect(() => {
  const controller = new AbortController();
  async function fetchData() {
    try {
      const res = await fetch(`/api/users?q=${query}`, { signal: controller.signal });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      if (err.name !== "AbortError") setError(err);
    }
  }
  fetchData();
  return () => controller.abort();
}, [query]);
```

---

### 48. Почему useEffect с пустым массивом зависимостей — это не аналог componentDidMount?

1. `useEffect` выполняется **асинхронно, после отрисовки** (paint). `componentDidMount` — синхронно, до отрисовки.
2. В **Strict Mode** React 18 `useEffect(fn, [])` выполнится **дважды** (mount → unmount → mount).
3. `useEffect` замыкает значения на момент рендера. `componentDidMount` читает мутабельные `this.props/this.state`.

---

### Паттерны проектирования в React

### 49. Что такое Compound Components (составные компоненты)?

Группа компонентов, работающих вместе через неявное состояние (Context). Пользователь собирает UI из «кирпичиков».

```jsx
const TabsContext = createContext(null);
function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}
function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return <button className={activeTab === value ? "active" : ""} onClick={() => setActiveTab(value)}>{children}</button>;
}
function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div>{children}</div> : null;
}
```

---

### 50. Что такое Render Props паттерн?

Компонент получает **функцию** через проп и вызывает её, передавая данные. Позволяет делиться логикой, не диктуя UI.

```jsx
function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);
  return children(pos);
}

<MouseTracker>{({ x, y }) => <p>Мышь: {x}, {y}</p>}</MouseTracker>
```

---

### 51. Что такое HOC (Higher Order Component)?

Функция, принимающая компонент и возвращающая новый компонент с расширенной функциональностью. Сейчас кастомные хуки предпочтительнее в большинстве случаев.

```jsx
function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <WrappedComponent {...props} user={user} />;
  };
}
```

---

### 52. Что такое паттерн Container/Presentational?

**Presentational** — только UI, получает данные через props. **Container** — логика, данные, передаёт в презентационные. С появлением хуков границы размылись — кастомные хуки берут роль контейнера.

---

### 53. Что такое паттерн Controlled vs Uncontrolled с forwardRef?

Компонент поддерживает оба режима: если передан `value` — контролируемый, если нет — управляет собой через внутренний state. `forwardRef` + `useImperativeHandle` дают родителю доступ к императивному API.

---

### 54. Что такое паттерн Provider?

Context API для предоставления данных вглубь дерева без prop drilling. Включает: `createContext`, компонент-провайдер с логикой, кастомный хук для потребления.

---

### 55. Что такое слоты (Slots) в React?

Передача JSX через **children** и **именованные пропсы** для размещения в определённых местах макета.

```jsx
function Layout({ header, sidebar, children, footer }) {
  return (
    <div>
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}
```

---

### 56. Как реализовать Composition vs Inheritance в React?

React рекомендует **композицию**: вложенность, пропсы, children. Наследование классов-компонентов — антипаттерн. Композиция позволяет гибко комбинировать поведение через хуки и оборачивание.

---

### Оптимизация производительности

### 57. Как работает React.memo?

HOC, мемоизирующий компонент: если пропсы не изменились (shallow compare), рендер пропускается. Использовать для тяжёлых компонентов, которые часто получают те же пропсы.

```jsx
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
});
```

---

### 58. Как профилировать производительность React-приложения?

1. **React DevTools Profiler** — flamegraph, ranked chart, причина рендера.
2. **Chrome DevTools Performance** — общий профиль (JS, Layout, Paint).
3. **`<Profiler>` компонент** — программный мониторинг.
4. **why-did-you-render** — автоматический лог причин ре-рендеров.
5. **Web Vitals** — LCP, FID, CLS.

---

### 59. Что такое code splitting и lazy loading?

Разделение бандла на чанки, загружаемые по мере необходимости. `React.lazy` + `Suspense`:

```jsx
const AdminPanel = lazy(() => import("./AdminPanel"));
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

---

### 60. Что такое виртуализация списков?

Рендер только **видимых элементов** (+ буфер). Библиотеки: `react-window` (лёгкая), `react-virtualized` (функциональная), `@tanstack/react-virtual` (headless).

```jsx
import { FixedSizeList } from "react-window";
<FixedSizeList height={600} itemCount={items.length} itemSize={50}>
  {({ index, style }) => <div style={style}>{items[index].name}</div>}
</FixedSizeList>
```

---

### 61. Что такое windowing (react-window, react-virtualized)?

Windowing = виртуализация: рендеринг только «окна» видимых данных. `react-window` — для списков/гридов, `react-virtualized` — для таблиц с сортировкой, `@tanstack/react-virtual` — headless максимальная гибкость.

---

### 62. Как оптимизировать контекст (Context)?

1. **Разделение контекстов** по домену.
2. **Разделение данных и действий** (StateContext + DispatchContext).
3. **Мемоизация значения**: `useMemo(() => ({ theme, setTheme }), [theme])`.
4. **React.memo** для потребителей.

---

### 63. Что такое startTransition?

Помечает обновление как низкоприоритетное. React может прервать его ради более важного (ввод пользователя). Улучшает отзывчивость при тяжёлых рендерах.

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => { setTab(nextTab); });
```

---

### Error Handling

### 64. Что такое Error Boundary?

Компонент (только классовый), перехватывающий ошибки в дочернем дереве и показывающий fallback UI. Методы: `static getDerivedStateFromError` и `componentDidCatch`. Не ловит ошибки в обработчиках событий, async-коде, SSR.

---

### 65. Как обрабатывать ошибки в асинхронных операциях?

`try/catch` в useEffect/обработчиках + состояние ошибки. Для проброса в Error Boundary: `setState(() => { throw error; })`. Лучше — React Query с встроенными error-состояниями.

---

### 66. Как реализовать fallback UI при ошибках?

Гранулярные Error Boundary для разных секций. Fallback-компонент с информацией об ошибке и кнопкой восстановления. Библиотека `react-error-boundary` упрощает реализацию.

---

### Серверный рендеринг

### 67. Что такое SSR (Server-Side Rendering) в React?

Рендеринг компонентов на сервере в HTML. Пользователь сразу видит контент (быстрый FCP), затем React «подхватывает» через гидратацию. Плюсы: SEO, быстрый FCP. Фреймворки: Next.js, Remix.

---

### 68. Что такое SSG (Static Site Generation)?

Генерация HTML на этапе **сборки**. Статические файлы на CDN — максимальная скорость. Подходит для блогов, документации. Ограничение: нужна пересборка при изменении данных.

---

### 69. Что такое ISR (Incremental Static Regeneration)?

Стратегия Next.js: статические страницы обновляются в фоне после деплоя через `revalidate`. Сочетает скорость SSG и актуальность SSR. Поддерживает On-Demand Revalidation через API.

---

### 70. Что такое Streaming SSR? Как работает renderToPipeableStream?

HTML отправляется клиенту **потоком**. Сервер начинает отдавать каркас сразу, Suspense-блоки «вливаются» по мере готовности данных. Значительно улучшает TTFB и FCP.

---

### 71. Что такое React Server Components?

Компоненты, выполняющиеся **исключительно на сервере** и не отправляющиеся клиенту как JS. Имеют прямой доступ к БД/файловой системе. Не увеличивают бандл. Для интерактивности нужны Client Components (`'use client'`). RSC и SSR дополняют друг друга.

---

### 72. Что такое гидратация (hydration)? Что такое selective hydration?

**Гидратация** — React «подключается» к серверному HTML, навешивая обработчики событий. **Selective hydration** (React 18) — части страницы гидратируются независимо через Suspense. Если пользователь кликает на не-гидратированный компонент, React приоритизирует его гидратацию.

---

## Управление состоянием

### 73. В чём разница между локальным, глобальным и серверным состоянием?

**Локальное** — useState для одного компонента. **Глобальное** — разделяется между многими компонентами (Context, Redux, Zustand). **Серверное** — данные с сервера (кэширование, ревалидация) — React Query, RTK Query.

---

### 74. Сравните Redux, MobX, Zustand, Jotai, Recoil.

| Библиотека | Подход | Когда использовать |
|---|---|---|
| **Redux (RTK)** | Единый стор, экшены, редьюсеры | Большие приложения, команды |
| **MobX** | Реактивное (observable) | ООП-подход, мутабельный стиль |
| **Zustand** | Единый стор, хуки | Средние проекты, минимум бойлерплейта |
| **Jotai** | Атомарный (bottom-up) | Много независимых состояний |
| **Recoil** | Атомарный + selectors | Граф зависимых состояний |

---

### 75. Как устроен Redux под капотом? Что такое middleware?

Redux — замыкание с `state` и `listeners[]`. `dispatch(action)` вызывает reducer → обновляет state → оповещает подписчиков. **Middleware** оборачивает dispatch (`store => next => action`), позволяя перехватывать экшены (логирование, асинхронность).

---

### 76. Что такое Redux Saga и Redux Thunk?

**Thunk** — dispatch'ит функции с `dispatch` и `getState`. Просто, покрывает 90% задач. **Saga** — долгоживущие процессы на генераторах с мощными операторами (`takeLatest`, `race`, `cancel`). Сложнее, но мощнее для сложной асинхронности.

---

### 77. Как работает RTK Query? Чем отличается от React Query?

**RTK Query** — часть Redux Toolkit, данные в Redux-сторе, инвалидация через теги. **React Query** — независимая, свой кэш, инвалидация через queryKey. RTK Query — если уже используете Redux. React Query — более гибкий как самостоятельное решение.

---

### 78. Что такое нормализация данных в стейте?

Каждая сущность хранится **один раз** в плоской структуре по id. Связи через идентификаторы. Преимущества: обновление в одном месте, быстрый доступ O(1), нет дублирования. В RTK — `createEntityAdapter`.

---

### 79. Что такое оптимистичные обновления (optimistic updates)?

UI обновляется **немедленно**, до ответа сервера. При ошибке — откат к предыдущему состоянию. Важно: всегда предусматривать rollback и ревалидацию.

```js
const mutation = useMutation({
  mutationFn: (newTodo) => axios.post("/api/todos", newTodo),
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previous = queryClient.getQueryData(["todos"]);
    queryClient.setQueryData(["todos"], (old) => [...old, newTodo]);
    return { previous };
  },
  onError: (err, _, context) => queryClient.setQueryData(["todos"], context.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
});
```

---

### 80. Как устроен Zustand? Почему он проще Redux?

Стор создаётся функцией `create`, возвращающей хук. Нет провайдера, нет бойлерплейта, встроенные селекторы. Под капотом использует `useSyncExternalStore`.

```js
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

function Counter() {
  const count = useStore((s) => s.count);
  const increment = useStore((s) => s.increment);
  return <button onClick={increment}>{count}</button>;
}
```

---

## Роутинг (продвинутый уровень)

### 81. Как работает React Router v6 под капотом?

Ядро — `@remix-run/router` (матчинг, навигация, история). Алгоритм матчинга основан на ранжировании: статический сегмент > динамический > wildcard. Используется React Context: `RouterContext` хранит `location`, `RouteContext` — текущий маршрут.

---

### 82. Что такое вложенные маршруты и Outlet?

Вложенные маршруты рендерятся внутри родительского. `<Outlet />` указывает, где рендерить дочерний маршрут. `<Route index>` — маршрут по умолчанию.

```jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />
  <Route path="stats" element={<Stats />} />
</Route>
```

---

### 83. Что такое loader и action в React Router v6?

**loader** — загрузка данных перед рендером маршрута (доступ через `useLoaderData`). **action** — обработка мутаций при отправке `<Form>`. Появились в v6.4+ с `createBrowserRouter`.

---

### 84. Как реализовать code splitting на уровне маршрутов?

`React.lazy` + `Suspense` для каждой страницы. Webpack/Vite автоматически создают отдельные чанки.

```jsx
const Dashboard = lazy(() => import("./pages/Dashboard"));
```

---

### 85. Как реализовать анимации при переходе между страницами?

`framer-motion` + `AnimatePresence` с `key={location.pathname}` на `<Routes>`.

---

### 86. Как работать с параметрами поиска (search params)?

Хук `useSearchParams` — как `useState`, но синхронизирован с URL. Делает фильтры shareable и работает с кнопками «Назад/Вперёд».

```jsx
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get("page")) || 1;
```

---

## Работа с API и данными

### 87. Как реализовать кэширование данных на клиенте?

Лучший подход — React Query / SWR (кэш, дедупликация, ревалидация из коробки). Ручное — через Map с TTL. HTTP-кэширование — заголовки `Cache-Control`, `ETag`.

---

### 88. Как работает React Query в деталях?

**staleTime** — время, пока данные считаются свежими (по умолчанию 0). **gcTime** — время жизни неиспользуемого кэша (по умолчанию 5 мин). **Refetching** — при монтировании, фокусе окна, восстановлении сети, по интервалу. `isLoading` — первый запрос. `isFetching` — любой (включая фоновый).

---

### 89. Как реализовать бесконечную прокрутку (infinite scroll)?

`useInfiniteQuery` + `IntersectionObserver` на последнем элементе. `getNextPageParam` определяет, есть ли следующая страница.

---

### 90. Что такое GraphQL? Чем отличается от REST?

GraphQL — язык запросов к API. Один эндпоинт, клиент запрашивает только нужные поля, строгая схема. REST — множество эндпоинтов, фиксированная структура ответа. GraphQL решает проблему over/under-fetching.

---

### 91. Как работать с WebSocket в React?

Открывать соединение в `useEffect`, закрывать в cleanup. Важно: реконнект при потере связи. Для production — `socket.io-client` или `use-websocket`.

---

### 92. Что такое Server-Sent Events (SSE)?

Однонаправленная передача данных от сервера по HTTP. Автоматический реконнект, проще WebSocket. Для лент новостей, уведомлений, котировок. `EventSource` API.

---

### 93. Как реализовать retry-логику?

Экспоненциальный backoff с jitter. React Query — встроенный `retry` и `retryDelay`. Axios — interceptors для обновления токена при 401.

---

## Тестирование (продвинутый уровень)

### 94. Как тестировать кастомные хуки?

`renderHook` из `@testing-library/react`. Обновления состояния в `act()`. Для хуков с контекстом — `wrapper`.

```js
const { result } = renderHook(() => useCounter(10));
act(() => { result.current.increment(); });
expect(result.current.count).toBe(11);
```

---

### 95. Как тестировать асинхронные операции?

`findBy*` — ждёт появления элемента. `waitFor` — повторяет assertion до успеха. Мокирование fetch через `jest.fn()` или `msw`.

---

### 96. Что такое моки и стабы?

**Стаб** — заглушка с фиксированным значением. **Мок** — записывает вызовы для проверки поведения. `jest.fn()` — мок. `jest.spyOn()` — шпион. `jest.mock()` — мокирование модуля.

---

### 97. Что такое snapshot-тестирование?

Сериализация рендер-вывода в файл `.snap`. При изменениях — тест падает. Подходит для UI-компонентов библиотеки. Не подходит для больших деревьев и часто меняющихся данных.

---

### 98. Как тестировать компоненты с контекстом и роутингом?

Хелпер `renderWithProviders` с `MemoryRouter` и провайдерами контекста. `MemoryRouter` с `initialEntries` для задания начального URL.

---

### 99. Как настроить CI/CD для тестов?

GitHub Actions / GitLab CI. `npm ci` → lint → typecheck → test → build. Кэширование node_modules. Coverage в Codecov. E2E после юнит-тестов.

---

### 100. Что такое Cypress / Playwright?

E2E-фреймворки для тестирования в реальном браузере. **Cypress** — jQuery-подобный API, мощный UI. **Playwright** — async/await, все браузеры, быстрее, параллельность из коробки. Использовать для критических пользовательских путей.

---

## Инструменты и DevOps

### 101. Как настроить Webpack с нуля для React-проекта?

`entry` → `babel-loader` (JSX) + `css-loader` + `style-loader` → `HtmlWebpackPlugin` → `devServer` с HMR. Для продакшена: `mode: 'production'`, `splitChunks`, `MiniCssExtractPlugin`.

---

### 102. Что такое tree shaking?

Удаление неиспользуемого кода из бандла. Работает благодаря статическому анализу ES-модулей. Требуется: ES-модули, `"sideEffects": false` в package.json, `mode: 'production'`.

---

### 103. Что такое Source Maps?

Файлы `.map`, устанавливающие соответствие между минифицированным кодом и исходным. `eval-source-map` для разработки, `source-map` для продакшена (с осторожностью — раскрывает код).

---

### 104. Что такое Docker? Как контейнеризировать React-приложение?

Multi-stage build: этап 1 — `node` для `npm run build`, этап 2 — `nginx` для раздачи статики. `.dockerignore` для исключения node_modules.

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

### 105. Как настроить CI/CD pipeline?

GitHub Actions: checkout → setup-node → `npm ci` → lint → test → build → deploy. Кэширование через `cache: 'npm'`. Branch protection rules для обязательного прохождения тестов.

---

### 106. Что такое мониторинг ошибок (Sentry, LogRocket)?

**Sentry** — перехват необработанных исключений, стек вызовов, контекст. **LogRocket** — видеозапись сессий пользователей. Интеграция через `Sentry.init()` и `<Sentry.ErrorBoundary>`. Загрузка source maps для читаемых стектрейсов.

---

### 107. Что такое Performance Budget?

Количественные ограничения на метрики производительности: размер бандла, LCP, CLS. Автоматизация через `performance.hints` в Webpack и Lighthouse CI. Предотвращает постепенную деградацию.

---

## Архитектура и паттерны

### 108. Как организовать файловую структуру React-проекта?

Малые проекты — группировка по типу (components/, hooks/, pages/). Средние/крупные — по фичам (features/auth/, features/products/). Принципы: колокация, barrel exports через index.js, shared/ для общих компонентов.

---

### 109. Что такое Feature-Sliced Design (FSD)?

Архитектурная методология: 7 слоёв (app, pages, widgets, features, entities, shared). Каждый слайс имеет сегменты (ui, model, api, lib). Главное правило: слой зависит **только от нижележащих**. Однонаправленный поток зависимостей.

---

### 110. Что такое монорепозиторий?

Несколько проектов в одном Git-репозитории. **Nx** — полнофункциональный фреймворк с графом зависимостей. **Turborepo** — лёгкий, фокус на кэшировании. Оба поддерживают инкрементальные сборки.

---

### 111. Что такое Micro Frontends?

Фронтенд разбивается на независимые приложения, разрабатываемые разными командами. Подходы: **Module Federation** (Webpack 5), iframe, Web Components. Имеет смысл для крупных организаций.

---

### 112. Что такое Design System и UI Kit?

**UI Kit** — набор переиспользуемых компонентов. **Design System** — шире: UI Kit + токены (цвета, отступы) + гайдлайны + документация. **Storybook** для документирования и визуального тестирования.

---

### 113. Что такое Atomic Design?

Методология Брэда Фроста: 5 уровней — **Atoms** (Button, Input) → **Molecules** (SearchField) → **Organisms** (Header, LoginForm) → **Templates** (скелеты страниц) → **Pages** (экземпляры с данными).

---

### 114. Как реализовать авторизацию и аутентификацию?

**JWT**: сервер выдаёт access + refresh токены. Access в памяти / localStorage, refresh в httpOnly cookie. Axios interceptor для автообновления токена. **OAuth 2.0** через Authorization Code Flow. `ProtectedRoute` — проверяет авторизацию, редиректит на /login.

---

## Безопасность

### 115. Что такое XSS? Как React защищает?

XSS — внедрение вредоносного JS. React **автоматически экранирует** все значения в JSX. Уязвимости: `dangerouslySetInnerHTML` без санитизации, `href="javascript:..."`. Защита: DOMPurify для HTML, валидация URL.

---

### 116. Что такое CSRF?

Подделка межсайтового запроса — браузер автоматически прикрепляет cookies. Защита: `SameSite=Strict` cookies, CSRF-токены, проверка `Origin`/`Referer`. JWT в заголовке Authorization не подвержен CSRF.

---

### 117. Как безопасно хранить токены?

**httpOnly cookie** — недоступен из JS, наиболее безопасен. **В памяти** (переменная) — самый безопасный для access token. **localStorage** — уязвим к XSS. Рекомендуемый паттерн: access token в памяти + refresh token в httpOnly cookie.

---

### 118. Что такое Content Security Policy (CSP)?

HTTP-заголовок, указывающий браузеру, какие ресурсы разрешено загружать. Эффективная защита от XSS. Начинайте с `Content-Security-Policy-Report-Only` для отладки.

---

### 119. Что такое dangerouslySetInnerHTML?

Аналог `innerHTML`, обходящий экранирование React. Использовать **только с санитизацией** (DOMPurify). Альтернативы: `react-markdown`, `html-react-parser`.

---

## Доступность (Accessibility)

### 120. Что такое WCAG?

Международный стандарт доступности. 4 принципа — **POUR**: Perceivable (воспринимаемый), Operable (управляемый), Understandable (понятный), Robust (надёжный). Уровни: A, AA (рекомендуемый), AAA.

---

### 121. Что такое ARIA-атрибуты?

Атрибуты для передачи семантики вспомогательным технологиям. `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-controls`, `aria-live`, `aria-hidden`, `role`. Правило: нативный HTML лучше, чем ARIA.

---

### 122. Как тестировать доступность?

**jest-axe** — автоматические проверки в тестах. **Testing Library** — поиск по ролям. **axe DevTools** / **Lighthouse** — в браузере. Ручное: навигация клавиатурой, скринридер. **eslint-plugin-jsx-a11y** — в редакторе.

---

### 123. Как реализовать навигацию с клавиатуры?

Нативные элементы (button, a, input) уже поддерживают клавиатуру. Для кастомных: `tabIndex={0}`, `onKeyDown` (Enter, Space). Skip-link для пропуска навигации. Видимый индикатор фокуса (`focus-visible`).

---

### 124. Что такое фокус-менеджмент в SPA?

Управление фокусом при навигации, модалках, динамическом контенте. При навигации — фокус на заголовок страницы. В модалке — **focus trap** (фокус не уходит за пределы). При закрытии — возврат фокуса на элемент-триггер.

---

## Фреймворки на базе React

### 125. Что такое Next.js?

Full-stack фреймворк: файловый роутинг, SSR/SSG/ISR, React Server Components, API Routes, Server Actions, оптимизация изображений, middleware. Рекомендуется командой React.

---

### 126. Pages Router vs App Router в Next.js?

**Pages Router** (`pages/`): `getServerSideProps`/`getStaticProps`, все компоненты клиентские. **App Router** (`app/`): React Server Components по умолчанию, вложенные layouts, `loading.jsx`/`error.jsx`, Server Actions. App Router — будущее Next.js.

---

### 127. Что такое Remix?

Full-stack фреймворк с акцентом на веб-стандарты и progressive enhancement. Вложенные маршруты с параллельной загрузкой данных (нет waterfall). Формы работают без JS. После action — автоматическая ревалидация loader'ов.

---

### 128. Что такое Gatsby?

Фреймворк для SSG. Данные из различных источников через GraphQL. Подходит для блогов, документации. Потерял популярность в пользу Next.js и Astro из-за медленных сборок.

---

### 129. Что такое Astro?

Фреймворк для контентных сайтов. По умолчанию **ноль JavaScript** на клиенте. **Islands Architecture** — интерактивные «острова» гидрируются независимо (`client:visible`, `client:load`, `client:idle`). Поддерживает React, Vue, Svelte одновременно. Лучшие Web Vitals.

---

### 130. Как выбрать между SPA, SSR и SSG?

**SPA** — дашборды, внутренние приложения, за авторизацией (SEO не нужен). **SSR** — интернет-магазины, соцсети, персонализированный контент + SEO. **SSG** — блоги, документация, лендинги. **Гибридный подход** (Next.js) — комбинация стратегий на уровне страниц — оптимален для большинства проектов.
