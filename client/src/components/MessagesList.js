import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './MessagesList.css';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`msg-row ${isMe ? 'msg-row--me' : ''}`}>
      {!isMe && (
        <span className="msg-avatar" style={{ background: msg.color + '22', borderColor: msg.color + '55' }}>
          <span style={{ color: msg.color }}>{msg.author[0].toUpperCase()}</span>
        </span>
      )}
      <div className="msg-body">
        {!isMe && (
          <span className="msg-author" style={{ color: msg.color }}>
            {msg.author}
          </span>
        )}
        <div className={`msg-bubble ${isMe ? 'msg-bubble--me' : ''}`}>
          <span className="msg-text">{msg.text}</span>
        </div>
        <span className="msg-time">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

function SystemMessage({ msg }) {
  return (
    <div className="msg-system">
      <span>{msg.text}</span>
      <span className="msg-system-time">{formatTime(msg.timestamp)}</span>
    </div>
  );
}

export default function MessagesList() {
  const messages = useSelector((s) => s.messages);
  const myId = useSelector((s) => s.myId);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages-list">
      {messages.length === 0 && (
        <div className="messages-empty">
          <span>no messages yet — say something 👋</span>
        </div>
      )}
      {messages.map((msg) =>
        msg.type === 'system' ? (
          <SystemMessage key={msg.id} msg={msg} />
        ) : (
          <MessageBubble key={msg.id} msg={msg} isMe={msg.authorId === myId} />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
