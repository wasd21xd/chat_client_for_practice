import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsername } from '../store/actions';
import './Login.css';

export default function Login() {
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    dispatch(setUsername(trimmed));
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-icon">💬</div>
        <h1 className="login-title">waveroom</h1>
        <p className="login-subtitle">real-time group chat</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="your name"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button className="login-btn" type="submit" disabled={!name.trim()}>
            join room →
          </button>
        </form>
      </div>
    </div>
  );
}
