import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import MessagesList from './MessagesList';
import AddMessage from './AddMessage';
import './Chat.css';

export default function Chat() {
  const connected = useSelector((s) => s.connected);

  return (
    <div className="chat-root">
      <Sidebar />
      <div className="chat-main">
        {!connected && (
          <div className="chat-connecting">
            <span className="chat-connecting-dot" />
            connecting…
          </div>
        )}
        <MessagesList />
        <AddMessage />
      </div>
    </div>
  );
}
