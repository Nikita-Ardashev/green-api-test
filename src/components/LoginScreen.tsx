import { useState, type FormEvent } from 'react';
import { createGreenApi, DEFAULT_API_URL, type InstanceState } from '../api/greenApi';
import type { Credentials } from '../types';
import { TextField } from './TextField';

const STATE_ERRORS: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован в Telegram. Авторизуйте его в личном кабинете GREEN-API.',
  pendingPassword: 'Инстанс ожидает пароль двухфакторной аутентификации — завершите вход в личном кабинете.',
  starting: 'Инстанс запускается. Попробуйте через минуту.',
  blocked: 'Аккаунт Telegram заблокирован.',
  suspended: 'На аккаунт наложены временные ограничения.',
};

export function LoginScreen({ onLogin }: { onLogin: (credentials: Credentials) => void }) {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const credentials = { apiUrl: apiUrl.trim(), idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() };
    if (!/^https?:\/\/\S+$/.test(credentials.apiUrl)) return setError('Укажите apiUrl, например https://api.green-api.com');
    if (!/^\d+$/.test(credentials.idInstance)) return setError('idInstance должен состоять только из цифр');
    if (!credentials.apiTokenInstance) return setError('Укажите apiTokenInstance');

    setError('');
    setLoading(true);
    try {
      const { stateInstance } = await createGreenApi(credentials).getStateInstance();
      if (stateInstance === 'authorized') onLogin(credentials);
      else setError(STATE_ERRORS[stateInstance] ?? `Инстанс в состоянии «${stateInstance}»`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось подключиться');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={handleSubmit} noValidate>
        <img className="login__logo" src="./favicon.svg" alt="" width={120} height={120} />
        <h1 className="login__title">Telegram</h1>
        <p className="login__subtitle">
          Войдите с учётными данными инстанса GREEN-API. Их можно найти в{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">личном кабинете</a>.
        </p>

        <TextField label="idInstance" value={idInstance} onChange={setIdInstance} inputMode="numeric" autoFocus />
        <TextField label="apiTokenInstance" value={apiTokenInstance} onChange={setApiTokenInstance} type="password" />
        <TextField label="apiUrl" value={apiUrl} onChange={setApiUrl} type="url" />

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner" aria-label="Проверка" /> : 'Войти'}
        </button>
      </form>
    </main>
  );
}
