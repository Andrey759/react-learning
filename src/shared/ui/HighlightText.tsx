// shared/ui/HighlightText.tsx

type Props = {
    text: string;
    highlight: string;
};

function HighlightText({ text, highlight }: Props) {
    if (!highlight) return <>{text}</>;

    // g — найти все совпадения в строке (без g остановится на первом)
    // i — игнорировать регистр (milk === Milk === MILK)
    const regex = new RegExp(`(${highlight})`, 'gi');

    // split с группой захвата () возвращает и разделители тоже:
    // 'buy milk today'.split(/(milk)/i) → ['buy ', 'milk', ' today']
    // без () было бы:                   → ['buy ', ' today']  — совпадение потеряно
    const parts = text.split(regex);

    // <> </> — это React.Fragment, пустой контейнер без реального DOM-элемента.
    // Нужен потому что JSX требует один корневой элемент,
    // а нам не нужен лишний <div> или <span> вокруг
    return (
        <>
            {parts.map((part, i) =>
                // каждая часть — либо совпадение, либо обычный текст
                // сравниваем без учёта регистра, чтобы 'Milk' тоже подсветилось
                part.toLowerCase() === highlight.toLowerCase()
                    ? <mark key={i} className="highlight">{part}</mark>
                    : part  // обычный текст вставляется как есть, без обёртки
            )}
        </>
    );
}

export default HighlightText;
