import { useEffect, useMemo, useRef, useState } from 'react';
import type { GreenApi } from '../api/greenApi';
import { formatListTime } from '../lib/format';
import type { Chat, Message } from '../types';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { NewChatPanel } from './NewChatPanel';

interface SidebarProps {
  api: GreenApi;
  idInstance: string;
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  isOnline: boolean;
  onSelectChat: (chatId: string) => void;
  onChatCreated: (chat: Chat) => void;
  onLogout: () => void;
}

export function Sidebar(props: SidebarProps) {
  const { api, idInstance, chats, messages, activeChatId, isOnline, onSelectChat, onChatCreated, onLogout } = props;
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isMenuOpen]);

  const sortedChats = useMemo(() => {
    const lastTime = (chat: Chat) => messages[chat.chatId]?.at(-1)?.timestamp ?? 0;
    const needle = query.trim().toLowerCase();
    return chats
      .filter((chat) => !needle || chat.title.toLowerCase().includes(needle) || chat.phone?.includes(needle))
      .sort((a, b) => lastTime(b) - lastTime(a));
  }, [chats, messages, query]);

  if (isCreating) {
    return (
      <aside className="sidebar">
        <NewChatPanel
          api={api}
          onBack={() => setIsCreating(false)}
          onCreated={(chat) => {
            setIsCreating(false);
            onChatCreated(chat);
          }}
        />
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <div className="menu" ref={menuRef}>
          <button className="icon-button" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Меню">
            <Icon name="menu" />
          </button>
          {isMenuOpen && (
            <div className="menu__dropdown" role="menu">
              <div className="menu__info">Инстанс {idInstance}</div>
              <button className="menu__item" role="menuitem" onClick={onLogout}>
                <Icon name="logout" size={20} /> Выйти
              </button>
            </div>
          )}
        </div>
        <label className="search">
          <Icon name="search" size={20} />
          <input
            className="search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isOnline ? 'Поиск' : 'Соединение…'}
            aria-label="Поиск по чатам"
          />
        </label>
      </header>

      <ul className="chat-list">
        {sortedChats.map((chat) => {
          const last = messages[chat.chatId]?.at(-1);
          return (
            <li key={chat.chatId}>
              <button
                className={`chat-item${chat.chatId === activeChatId ? ' chat-item--active' : ''}`}
                onClick={() => onSelectChat(chat.chatId)}
              >
                <Avatar seed={chat.chatId} title={chat.title} />
                <span className="chat-item__body">
                  <span className="chat-item__row">
                    <span className="chat-item__title">{chat.title}</span>
                    {last && <span className="chat-item__time">{formatListTime(last.timestamp)}</span>}
                  </span>
                  <span className="chat-item__preview">
                    {last ? (
                      <>
                        {last.direction === 'out' && <span className="chat-item__you">Вы: </span>}
                        {last.text}
                      </>
                    ) : (
                      chat.phone ?? 'Нет сообщений'
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {chats.length === 0 && (
        <div className="sidebar__empty">
          <p>Здесь пока пусто.</p>
          <p>Нажмите на карандаш, чтобы начать новый чат по номеру телефона.</p>
        </div>
      )}
      {chats.length > 0 && sortedChats.length === 0 && <div className="sidebar__empty">Ничего не найдено</div>}

      <button className="fab" onClick={() => setIsCreating(true)} aria-label="Новый чат" title="Новый чат">
        <Icon name="pencil" />
      </button>
    </aside>
  );
}
