import { useState, type FormEvent } from 'react';
import type { GreenApi } from '../api/greenApi';
import { formatPhone, parseContact } from '../lib/contact';
import type { Chat } from '../types';
import { Icon } from './Icon';
import { TextField } from './TextField';

interface NewChatPanelProps {
  api: GreenApi;
  onBack: () => void;
  onCreated: (chat: Chat) => void;
}

export function NewChatPanel({ api, onBack, onCreated }: NewChatPanelProps) {
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const query = parseContact(contact);
    if (!query) return setError('Введите номер в международном формате, например +7 900 123-45-67, или @username');

    setError('');
    setLoading(true);
    try {
      const account = await api.checkAccount(query);
      if (!account.exist || !account.chatId) {
        setError('Этот пользователь не найден в Telegram');
        return;
      }
      const phone = 'phoneNumber' in query ? formatPhone(query.phoneNumber) : undefined;
      onCreated({
        chatId: account.chatId,
        title: phone ?? account.username ?? ('username' in query ? query.username : account.chatId),
        phone,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось проверить номер');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="new-chat">
      <header className="sidebar__header">
        <button className="icon-button" onClick={onBack} aria-label="Назад">
          <Icon name="back" />
        </button>
        <h2 className="sidebar__heading">Новый чат</h2>
      </header>
      <form className="new-chat__form" onSubmit={handleSubmit} noValidate>
        <TextField label="Номер телефона" value={contact} onChange={setContact} type="tel" inputMode="tel" autoFocus />
        <p className="hint">Номер получателя с кодом страны. Можно указать и Telegram-username, например @durov.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button-primary" type="submit" disabled={loading || !contact.trim()}>
          {loading ? <span className="spinner" aria-label="Поиск" /> : 'Создать чат'}
        </button>
      </form>
    </div>
  );
}
