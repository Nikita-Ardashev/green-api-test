import { useCallback, useEffect, useReducer } from 'react';
import type { GreenApi } from '../api/greenApi';
import { loadJson, saveJson } from '../lib/storage';
import { chatReducer, initialChatState, type ChatState } from '../store/chatReducer';

function loadState(storageKey: string): ChatState {
  const saved = loadJson<ChatState>(storageKey);
  if (!saved?.chats || !saved.messages) return initialChatState;

  const messages = Object.fromEntries(
    Object.entries(saved.messages).map(([chatId, list]) => [
      chatId,
      list.map((m) => (m.status === 'pending' ? { ...m, status: 'failed' as const } : m)),
    ]),
  );
  return { chats: saved.chats, messages };
}

export function useChats(api: GreenApi, idInstance: string) {
  const storageKey = `green-api-tg:chats:${idInstance}`;
  const [state, dispatch] = useReducer(chatReducer, storageKey, loadState);

  useEffect(() => saveJson(storageKey, state), [storageKey, state]);

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'messageAdded',
        message: { id: tempId, chatId, text, direction: 'out', timestamp: Date.now(), status: 'pending' },
      });

      try {
        const { idMessage } = await api.sendMessage(chatId, text);
        dispatch({ type: 'messageSent', chatId, tempId, idMessage });
      } catch (error) {
        dispatch({ type: 'messageFailed', chatId, tempId });
        throw error;
      }
    },
    [api],
  );

  return { state, dispatch, sendMessage };
}
