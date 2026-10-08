import type { Message, MessageStatus } from '../types';

export type ChatEvent =
  | { type: 'message'; message: Message; chatName?: string }
  | { type: 'status'; idMessage: string; status: MessageStatus }
  | { type: 'ignored' };

interface MessageData {
  typeMessage?: string;
  textMessageData?: { textMessage?: string };
  extendedTextMessageData?: { text?: string };
}

interface NotificationBody {
  typeWebhook?: string;
  idMessage?: string;
  timestamp?: number;
  status?: string;
  chatId?: string;
  senderData?: { chatId?: string; chatName?: string; senderName?: string };
  messageData?: MessageData;
}

const IGNORED: ChatEvent = { type: 'ignored' };

function extractText(data: MessageData | undefined): string | null {
  switch (data?.typeMessage) {
    case 'textMessage':
      return data.textMessageData?.textMessage ?? null;
    case 'extendedTextMessage':
    case 'quotedMessage':
      return data.extendedTextMessageData?.text ?? null;
    default:
      return null;
  }
}

function toStatus(status: string | undefined): MessageStatus | null {
  switch (status) {
    case 'sent':
    case 'delivered':
    case 'read':
      return status;
    case 'failed':
    case 'noAccount':
    case 'notInGroup':
      return 'failed';
    default:
      return null;
  }
}

export function parseNotification(raw: unknown): ChatEvent {
  if (!raw || typeof raw !== 'object') return IGNORED;
  const body = raw as NotificationBody;

  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
    case 'outgoingMessageReceived':
    case 'outgoingAPIMessageReceived': {
      const chatId = body.senderData?.chatId;
      if (!chatId || !body.idMessage) return IGNORED;

      const text = extractText(body.messageData);
      const incoming = body.typeWebhook === 'incomingMessageReceived';
      return {
        type: 'message',
        chatName: body.senderData?.chatName || body.senderData?.senderName || undefined,
        message: {
          id: body.idMessage,
          chatId,
          text: text ?? 'Сообщение этого типа не поддерживается',
          ...(text === null && { unsupported: true }),
          direction: incoming ? 'in' : 'out',
          timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
          status: incoming ? undefined : 'sent',
        },
      };
    }
    case 'outgoingMessageStatus': {
      const status = toStatus(body.status);
      return status && body.idMessage ? { type: 'status', idMessage: body.idMessage, status } : IGNORED;
    }
    default:
      return IGNORED;
  }
}
