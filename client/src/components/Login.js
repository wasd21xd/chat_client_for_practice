import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authRequest } from '../store/actions';
import './Login.css';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const authError = useSelector((s) => s.authError);
  const connected = useSelector((s) => s.connected);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    dispatch(authRequest(mode, username.trim(), password));
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-icon">💬</div>
        <h1 className="login-title">waveroom</h1>
        <p className="login-subtitle">real-time group chat</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'login-tab--active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            войти
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'login-tab--active' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >
            регистрация
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="имя пользователя"
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <input
            className="login-input"
            type="password"
            placeholder={mode === 'register' ? 'пароль (минимум 4 символа)' : 'пароль'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
          {authError && <p className="login-error">{authError}</p>}
          <button
            className="login-btn"
            type="submit"
            disabled={!username.trim() || !password.trim() || !connected}
          >
            {!connected ? 'подключение...' : mode === 'login' ? 'войти →' : 'создать аккаунт →'}
          </button>
        </form>
      </div>
    </div>
  );
}
