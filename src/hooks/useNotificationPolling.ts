import { useEffect, useRef, useState } from 'react';
import type { GreenApi } from '../api/greenApi';
import { parseNotification, type ChatEvent } from '../lib/notifications';

const RECEIVE_TIMEOUT_SECONDS = 20;
const RETRY_DELAY_MS = 3000;

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function useNotificationPolling(api: GreenApi, onEvent: (event: ChatEvent) => void) {
  const [isOnline, setIsOnline] = useState(true);
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      while (!signal.aborted) {
        try {
          const notification = await api.receiveNotification(RECEIVE_TIMEOUT_SECONDS, signal);
          setIsOnline(true);
          if (!notification) continue;

          try {
            onEventRef.current(parseNotification(notification.body));
          } finally {
            await api.deleteNotification(notification.receiptId, signal);
          }
        } catch (error) {
          if (signal.aborted) return;
          console.warn('GREEN-API polling error', error);
          setIsOnline(false);
          await delay(RETRY_DELAY_MS, signal);
        }
      }
    })();

    return () => controller.abort();
  }, [api]);

  return { isOnline };
}
