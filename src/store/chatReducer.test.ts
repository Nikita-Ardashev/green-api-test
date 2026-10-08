import { describe, expect, it } from 'vitest';
import type { Message } from '../types';
import { chatReducer, initialChatState, type ChatState } from './chatReducer';

const outgoing = (id: string, status: Message['status'] = 'pending'): Message => ({
  id,
  chatId: '1',
  text: 'hi',
  direction: 'out',
  timestamp: 1000,
  status,
});

const withMessages = (...messages: Message[]): ChatState => ({
  chats: [{ chatId: '1', title: 'Тест' }],
  messages: { '1': messages },
});

describe('chatReducer', () => {
  it('создаёт чат при входящем сообщении от нового собеседника', () => {
    const state = chatReducer(initialChatState, {
      type: 'messageAdded',
      chatName: 'Василиса',
      message: { id: 'a', chatId: '42', text: 'привет', direction: 'in', timestamp: 1 },
    });
    expect(state.chats).toEqual([{ chatId: '42', title: 'Василиса' }]);
    expect(state.messages['42']).toHaveLength(1);
  });

  it('не дублирует сообщение с тем же id', () => {
    const state = withMessages(outgoing('a', 'sent'));
    expect(chatReducer(state, { type: 'messageAdded', message: outgoing('a', 'sent') })).toBe(state);
  });

  it('заменяет временный id на idMessage после отправки', () => {
    const state = chatReducer(withMessages(outgoing('tmp')), {
      type: 'messageSent',
      chatId: '1',
      tempId: 'tmp',
      idMessage: 'real',
    });
    expect(state.messages['1']).toEqual([outgoing('real', 'sent')]);
  });

  it('убирает временное сообщение, если уведомление о нём пришло раньше ответа sendMessage', () => {
    const state = chatReducer(withMessages(outgoing('tmp'), outgoing('real', 'sent')), {
      type: 'messageSent',
      chatId: '1',
      tempId: 'tmp',
      idMessage: 'real',
    });
    expect(state.messages['1'].map((m) => m.id)).toEqual(['real']);
  });

  it('не откатывает статус «прочитано» к «доставлено»', () => {
    const state = chatReducer(withMessages(outgoing('a', 'read')), {
      type: 'statusChanged',
      idMessage: 'a',
      status: 'delivered',
    });
    expect(state.messages['1'][0].status).toBe('read');
  });
});
