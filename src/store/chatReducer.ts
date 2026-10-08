import type { Chat, Message, MessageStatus } from '../types';

export interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
}

export type ChatAction =
  | { type: 'chatAdded'; chat: Chat }
  | { type: 'messageAdded'; message: Message; chatName?: string }
  | { type: 'messageSent'; chatId: string; tempId: string; idMessage: string }
  | { type: 'messageFailed'; chatId: string; tempId: string }
  | { type: 'statusChanged'; idMessage: string; status: MessageStatus };

export const initialChatState: ChatState = { chats: [], messages: {} };

const STATUS_ORDER: MessageStatus[] = ['pending', 'sent', 'delivered', 'read'];

function mergeStatus(current: MessageStatus | undefined, next: MessageStatus): MessageStatus {
  if (!current || next === 'failed') return next;
  return STATUS_ORDER.indexOf(next) > STATUS_ORDER.indexOf(current) ? next : current;
}

function updateChatMessages(
  state: ChatState,
  chatId: string,
  update: (messages: Message[]) => Message[],
): ChatState {
  return { ...state, messages: { ...state.messages, [chatId]: update(state.messages[chatId] ?? []) } };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chatAdded': {
      if (state.chats.some((chat) => chat.chatId === action.chat.chatId)) return state;
      return { ...state, chats: [action.chat, ...state.chats] };
    }

    case 'messageAdded': {
      const { message } = action;
      const chats = state.chats.some((chat) => chat.chatId === message.chatId)
        ? state.chats
        : [{ chatId: message.chatId, title: action.chatName ?? message.chatId }, ...state.chats];

      const existing = state.messages[message.chatId] ?? [];
      if (existing.some((m) => m.id === message.id)) return chats === state.chats ? state : { ...state, chats };

      const messages = [...existing, message].sort((a, b) => a.timestamp - b.timestamp);
      return { chats, messages: { ...state.messages, [message.chatId]: messages } };
    }

    case 'messageSent':
      return updateChatMessages(state, action.chatId, (messages) =>
        messages.some((m) => m.id === action.idMessage)
          ? messages.filter((m) => m.id !== action.tempId)
          : messages.map((m) =>
              m.id === action.tempId ? { ...m, id: action.idMessage, status: mergeStatus(m.status, 'sent') } : m,
            ),
      );

    case 'messageFailed':
      return updateChatMessages(state, action.chatId, (messages) =>
        messages.map((m) => (m.id === action.tempId ? { ...m, status: 'failed' } : m)),
      );

    case 'statusChanged': {
      for (const [chatId, messages] of Object.entries(state.messages)) {
        if (messages.some((m) => m.id === action.idMessage)) {
          return updateChatMessages(state, chatId, (list) =>
            list.map((m) => (m.id === action.idMessage ? { ...m, status: mergeStatus(m.status, action.status) } : m)),
          );
        }
      }
      return state;
    }
  }
}
