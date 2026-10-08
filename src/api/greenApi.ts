import type { Credentials } from '../types';

export class GreenApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}

export type InstanceState =
  | 'notAuthorized'
  | 'authorized'
  | 'blocked'
  | 'suspended'
  | 'starting'
  | 'pendingPassword';

export interface InstanceSettings {
  webhookUrl?: string;
  incomingWebhook?: 'yes' | 'no';
  outgoingWebhook?: 'yes' | 'no';
  outgoingMessageWebhook?: 'yes' | 'no';
  outgoingAPIMessageWebhook?: 'yes' | 'no';
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
  username?: string;
  phoneNumber?: number;
}

export interface QueueNotification {
  receiptId: number;
  body: unknown;
}

export const DEFAULT_API_URL = 'https://api.green-api.com';

interface RequestOptions {
  body?: unknown;
  tail?: string;
  query?: Record<string, string | number>;
  signal?: AbortSignal;
}

function describeHttpError(status: number): string {
  switch (status) {
    case 400:
      return 'Некорректный запрос';
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance';
    case 404:
      return 'Инстанс не найден — проверьте apiUrl и idInstance';
    case 429:
      return 'Слишком много запросов, попробуйте чуть позже';
    case 466:
      return 'Исчерпан лимит тарифа (на бесплатном тарифе можно писать только в 3 чата)';
    default:
      return status >= 500 ? 'Сервер GREEN-API временно недоступен' : `Ошибка HTTP ${status}`;
  }
}

export function createGreenApi({ apiUrl, idInstance, apiTokenInstance }: Credentials) {
  const base = `${apiUrl.trim().replace(/\/+$/, '')}/waInstance${idInstance.trim()}`;
  const token = apiTokenInstance.trim();

  async function request<T>(method: string, apiMethod: string, options: RequestOptions = {}): Promise<T> {
    const { body, tail, query, signal } = options;
    let url = `${base}/${apiMethod}/${token}`;
    if (tail) url += `/${tail}`;
    if (query) url += `?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        signal,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new GreenApiError('Нет соединения с GREEN-API — проверьте интернет и apiUrl');
    }

    if (!response.ok) throw new GreenApiError(describeHttpError(response.status), response.status);

    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  return {
    getStateInstance: (signal?: AbortSignal) =>
      request<{ stateInstance: InstanceState }>('GET', 'getStateInstance', { signal }),

    getSettings: () => request<InstanceSettings>('GET', 'getSettings'),

    setSettings: (settings: InstanceSettings) =>
      request<{ saveSettings: boolean }>('POST', 'setSettings', { body: settings }),

    checkAccount: (contact: { phoneNumber: number } | { username: string }) =>
      request<CheckAccountResponse>('POST', 'checkAccount', { body: contact }),

    sendMessage: (chatId: string, message: string) =>
      request<{ idMessage: string }>('POST', 'sendMessage', { body: { chatId, message } }),

    receiveNotification: (receiveTimeout: number, signal?: AbortSignal) =>
      request<QueueNotification | null>('GET', 'receiveNotification', { query: { receiveTimeout }, signal }),

    deleteNotification: (receiptId: number, signal?: AbortSignal) =>
      request<{ result: boolean }>('DELETE', 'deleteNotification', { tail: String(receiptId), signal }),
  };
}

export type GreenApi = ReturnType<typeof createGreenApi>;
