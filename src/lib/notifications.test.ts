import { describe, expect, it } from 'vitest';
import { parseNotification } from './notifications';

const incomingText = {
  typeWebhook: 'incomingMessageReceived',
  timestamp: 1763115112,
  idMessage: '126543123451133331119',
  senderData: { chatId: '10000000', chatName: 'Василиса', senderName: 'Василиса Премудрая' },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет от Green-API!' } },
};

describe('parseNotification', () => {
  it('разбирает входящее текстовое сообщение', () => {
    expect(parseNotification(incomingText)).toEqual({
      type: 'message',
      chatName: 'Василиса',
      message: {
        id: '126543123451133331119',
        chatId: '10000000',
        text: 'Привет от Green-API!',
        direction: 'in',
        timestamp: 1763115112000,
        status: undefined,
      },
    });
  });

  it('берёт текст из extendedTextMessage', () => {
    const event = parseNotification({
      ...incomingText,
      messageData: { typeMessage: 'extendedTextMessage', extendedTextMessageData: { text: 'ссылка' } },
    });
    expect(event.type === 'message' && event.message.text).toBe('ссылка');
  });

  it('помечает нетекстовые сообщения как неподдерживаемые', () => {
    const event = parseNotification({ ...incomingText, messageData: { typeMessage: 'imageMessage' } });
    expect(event.type === 'message' && event.message.unsupported).toBe(true);
  });

  it('исходящее с телефона — сообщение со статусом sent', () => {
    const event = parseNotification({ ...incomingText, typeWebhook: 'outgoingMessageReceived' });
    expect(event.type === 'message' && [event.message.direction, event.message.status]).toEqual(['out', 'sent']);
  });

  it('разбирает статус исходящего сообщения', () => {
    expect(parseNotification({ typeWebhook: 'outgoingMessageStatus', idMessage: 'abc', status: 'read' })).toEqual({
      type: 'status',
      idMessage: 'abc',
      status: 'read',
    });
    expect(parseNotification({ typeWebhook: 'outgoingMessageStatus', idMessage: 'abc', status: 'noAccount' })).toEqual({
      type: 'status',
      idMessage: 'abc',
      status: 'failed',
    });
  });

  it('игнорирует прочие уведомления и мусор', () => {
    expect(parseNotification({ typeWebhook: 'stateInstanceChanged' })).toEqual({ type: 'ignored' });
    expect(parseNotification(null)).toEqual({ type: 'ignored' });
  });
});
