import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Messenger } from './components/Messenger';
import { loadJson, removeKey, saveJson } from './lib/storage';
import type { Credentials } from './types';

const CREDENTIALS_KEY = 'green-api-tg:credentials';

export function App() {
  const [credentials, setCredentials] = useState(() => loadJson<Credentials>(CREDENTIALS_KEY));

  function handleLogin(next: Credentials) {
    saveJson(CREDENTIALS_KEY, next);
    setCredentials(next);
  }

  function handleLogout() {
    removeKey(CREDENTIALS_KEY);
    setCredentials(null);
  }

  return credentials ? (
    <Messenger key={credentials.idInstance} credentials={credentials} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
}
