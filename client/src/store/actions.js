import * as T from './actionTypes';

export const wsConnect = (url) => ({ type: T.WS_CONNECT, url });
export const wsConnected = () => ({ type: T.WS_CONNECTED });
export const wsDisconnected = () => ({ type: T.WS_DISCONNECTED });

export const setUsername = (username) => ({ type: T.SET_USERNAME, username });
export const setMyInfo = (info) => ({ type: T.SET_MY_INFO, info });
export const updateUsers = (users) => ({ type: T.UPDATE_USERS, users });

export const sendMessage = (text) => ({ type: T.SEND_MESSAGE, text });
export const receiveMessage = (msg) => ({ type: T.RECEIVE_MESSAGE, msg });
export const receiveSystem = (msg) => ({ type: T.RECEIVE_SYSTEM, msg });
