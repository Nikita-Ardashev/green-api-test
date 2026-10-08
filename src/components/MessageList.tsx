import { Fragment, useLayoutEffect, useRef } from 'react';
import { formatDayLabel, formatTime, isSameDay } from '../lib/format';
import type { Message } from '../types';
import { StatusChecks } from './Icon';

const STATUS_LABELS = { pending: 'Отправляется', sent: 'Отправлено', delivered: 'Доставлено', read: 'Прочитано', failed: 'Не отправлено' };

function MessageStatusMark({ status }: { status: Message['status'] }) {
  if (!status) return null;
  const label = STATUS_LABELS[status];
  if (status === 'pending') return <span className="bubble__status bubble__status--pending" title={label} />;
  if (status === 'failed') return <span className="bubble__status bubble__status--failed" title={label}>!</span>;
  return (
    <span className="bubble__status" title={label}>
      <StatusChecks double={status === 'read'} />
    </span>
  );
}

export function MessageList({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  return (
    <div className="messages" ref={scrollRef}>
      <div className="messages__inner">
        {messages.length === 0 && <div className="service-pill messages__empty">Сообщений пока нет — напишите первым!</div>}

        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const next = messages[index + 1];
          const newDay = !prev || !isSameDay(prev.timestamp, message.timestamp);
          const lastInGroup =
            !next || next.direction !== message.direction || !isSameDay(next.timestamp, message.timestamp);

          return (
            <Fragment key={message.id}>
              {newDay && <div className="service-pill messages__date">{formatDayLabel(message.timestamp)}</div>}
              <div
                className={[
                  'bubble',
                  `bubble--${message.direction}`,
                  lastInGroup && 'bubble--tail',
                  message.unsupported && 'bubble--unsupported',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="bubble__text">{message.text}</span>
                <span className="bubble__meta">
                  {formatTime(message.timestamp)}
                  {message.direction === 'out' && <MessageStatusMark status={message.status} />}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
