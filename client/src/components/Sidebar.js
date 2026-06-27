import React from 'react';
import { useSelector } from 'react-redux';
import './Sidebar.css';

function Avatar({ color, username }) {
  return (
    <span className="avatar" style={{ background: color + '22', borderColor: color + '55' }}>
      <span style={{ color }}>{username[0].toUpperCase()}</span>
    </span>
  );
}

export default function Sidebar() {
  const users = useSelector((s) => s.users);
  const myId = useSelector((s) => s.myId);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-room">waveroom</span>
        <span className="sidebar-dot" />
        <span className="sidebar-online">{users.length} online</span>
      </div>
      <ul className="user-list">
        {users.map((u) => (
          <li key={u.id} className={`user-item ${u.id === myId ? 'user-me' : ''}`}>
            <Avatar color={u.color} username={u.username} />
            <span className="user-name">{u.username}</span>
            {u.id === myId && <span className="user-you">you</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
}
