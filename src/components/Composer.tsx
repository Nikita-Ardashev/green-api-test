import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Icon } from './Icon';

const MAX_LENGTH = 4096;

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  }

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer__field">
        <textarea
          ref={textareaRef}
          className="composer__input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
          maxLength={MAX_LENGTH}
          aria-label="Текст сообщения"
          autoFocus
        />
      </div>
      <button className="composer__send" type="submit" disabled={!canSend} aria-label="Отправить">
        <Icon name="send" />
      </button>
    </form>
  );
}
