import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../store/actions';
import './AddMessage.css';

export default function AddMessage() {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const myUsername = useSelector((s) => s.myUsername);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(sendMessage(trimmed));
    setText('');
  };

  return (
    <div className="add-message">
      <textarea
        className="add-message-input"
        placeholder={`message as ${myUsername}…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={500}
      />
      <button
        className="add-message-btn"
        onClick={submit}
        disabled={!text.trim()}
        title="Send (Enter)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
