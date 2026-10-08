import { useCallback, useEffect, useMemo, useState } from 'react';
import { createGreenApi } from '../api/greenApi';
import { useChats } from '../hooks/useChats';
import { useNotificationPolling } from '../hooks/useNotificationPolling';
import type { ChatEvent } from '../lib/notifications';
import type { Chat, Credentials } from '../types';
import { ChatPanel } from './ChatPanel';
import { Icon } from './Icon';
import { Sidebar } from './Sidebar';

interface MessengerProps {
  credentials: Credentials;
  onLogout: () => void;
}

export function Messenger({ credentials, onLogout }: MessengerProps) {
  const api = useMemo(() => createGreenApi(credentials), [credentials]);
  const { state, dispatch, sendMessage } = useChats(api, credentials.idInstance);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [settingsWarning, setSettingsWarning] = useState(false);

  const handleEvent = useCallback(
    (event: ChatEvent) => {
      if (event.type === 'message') dispatch({ type: 'messageAdded', message: event.message, chatName: event.chatName });
      if (event.type === 'status') dispatch({ type: 'statusChanged', idMessage: event.idMessage, status: event.status });
    },
    [dispatch],
  );
  const { isOnline } = useNotificationPolling(api, handleEvent);

  useEffect(() => {
    api
      .getSettings()
      .then((settings) => setSettingsWarning(Boolean(settings.webhookUrl) || settings.incomingWebhook === 'no'))
      .catch(() => {});
  }, [api]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fixSettings() {
    try {
      await api.setSettings({
        webhookUrl: '',
        incomingWebhook: 'yes',
        outgoingWebhook: 'yes',
        outgoingMessageWebhook: 'yes',
        outgoingAPIMessageWebhook: 'yes',
      });
      setSettingsWarning(false);
      setToast('Настройки сохранены. Инстанс применит их в течение пары минут');
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Не удалось сохранить настройки');
    }
  }

  function handleChatCreated(chat: Chat) {
    dispatch({ type: 'chatAdded', chat });
    setActiveChatId(chat.chatId);
  }

  function handleSend(text: string) {
    if (!activeChatId) return;
    sendMessage(activeChatId, text).catch((e) => setToast(e instanceof Error ? e.message : 'Сообщение не отправлено'));
  }

  const activeChat = state.chats.find((chat) => chat.chatId === activeChatId);

  return (
    <div className={`messenger${activeChat ? ' messenger--chat-open' : ''}`}>
      <Sidebar
        api={api}
        idInstance={credentials.idInstance}
        chats={state.chats}
        messages={state.messages}
        activeChatId={activeChatId}
        isOnline={isOnline}
        onSelectChat={setActiveChatId}
        onChatCreated={handleChatCreated}
        onLogout={onLogout}
      />

      {activeChat ? (
        <ChatPanel
          chat={activeChat}
          messages={state.messages[activeChat.chatId] ?? []}
          onSend={handleSend}
          onBack={() => setActiveChatId(null)}
        />
      ) : (
        <section className="chat chat--empty">
          <div className="service-pill">Выберите, кому хотели бы написать</div>
        </section>
      )}

      {settingsWarning && (
        <div className="banner" role="alert">
          <Icon name="alert" size={20} />
          <span>
            В настройках инстанса задан webhookUrl или выключены входящие уведомления — входящие сообщения не будут
            приходить.
          </span>
          <button className="banner__action" onClick={fixSettings}>Исправить</button>
          <button className="icon-button" onClick={() => setSettingsWarning(false)} aria-label="Скрыть">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
