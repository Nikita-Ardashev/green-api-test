import type { Chat, Message } from '../types';
import { Avatar } from './Avatar';
import { Composer } from './Composer';
import { Icon } from './Icon';
import { MessageList } from './MessageList';

interface ChatPanelProps {
  chat: Chat;
  messages: Message[];
  onSend: (text: string) => void;
  onBack: () => void;
}

export function ChatPanel({ chat, messages, onSend, onBack }: ChatPanelProps) {
  return (
    <section className="chat">
      <header className="chat__header">
        <button className="icon-button chat__back" onClick={onBack} aria-label="К списку чатов">
          <Icon name="back" />
        </button>
        <Avatar seed={chat.chatId} title={chat.title} size={42} />
        <div className="chat__info">
          <div className="chat__title">{chat.title}</div>
          <div className="chat__subtitle">{chat.phone && chat.phone !== chat.title ? chat.phone : 'Telegram'}</div>
        </div>
      </header>

      <MessageList messages={messages} />

      <Composer key={chat.chatId} onSend={onSend} />
    </section>
  );
}
