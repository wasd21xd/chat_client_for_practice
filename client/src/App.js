import React from 'react';
import { useSelector } from 'react-redux';
import Login from './components/Login';
import Chat from './components/Chat';

export default function App() {
  const myUsername = useSelector((s) => s.myUsername);
  return myUsername ? <Chat /> : <Login />;
}
