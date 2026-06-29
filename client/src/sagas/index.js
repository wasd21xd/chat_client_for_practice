import { take, put, call, fork, race, cancel } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import * as T from '../store/actionTypes';
import {
  wsConnected, wsDisconnected, setMyInfo, updateUsers,
  receiveMessage, receiveSystem, loadHistory, authError,
} from '../store/actions';

const WS_URL =
  process.env.REACT_APP_WS_URL ||
  (window.location.hostname === 'localhost' ? 'ws://localhost:8080' : `wss://${window.location.hostname}`);

let globalSocket = null;

function createSocketChannel(socket) {
  return eventChannel((emit) => {
    socket.onmessage = (event) => {
      try { emit(JSON.parse(event.data)); } catch {}
    };
    socket.onclose = () => emit(END);
    socket.onerror = () => emit(END);
    return () => socket.close();
  });
}

function* watchMessages(channel) {
  while (true) {
    const data = yield take(channel);
    switch (data.type) {
      case 'WELCOME':
        yield put(setMyInfo({ id: data.id, username: data.username, color: data.color }));
        if (data.history) yield put(loadHistory(data.history));
        break;
      case 'AUTH_ERROR':
        yield put(authError(data.message));
        break;
      case 'USERS_UPDATE':
        yield put(updateUsers(data.users));
        break;
      case 'MESSAGE':
        yield put(receiveMessage(data));
        break;
      case 'SYSTEM':
        yield put(receiveSystem(data));
        break;
      default:
        break;
    }
  }
}

function* handleSession(socket) {
  yield put(wsConnected());
  const channel = createSocketChannel(socket);
  const messageTask = yield fork(watchMessages, channel);

  while (true) {
    const { send } = yield race({
      send: take(T.SEND_MESSAGE),
      end: take(END),
    });
    if (!send) break;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'MESSAGE', text: send.text }));
    }
  }
  yield cancel(messageTask);
}

function* watchAuth() {
  // Open socket once on startup
  const socket = new WebSocket(WS_URL);
  globalSocket = socket;

  yield new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  yield put(wsConnected());
  const channel = createSocketChannel(socket);
  const messageTask = yield fork(watchMessages, channel);

  while (true) {
    const action = yield take([T.AUTH_REQUEST, T.SEND_MESSAGE]);

    if (action.type === T.AUTH_REQUEST) {
      socket.send(JSON.stringify({
        type: action.mode === 'register' ? 'REGISTER' : 'LOGIN',
        username: action.username,
        password: action.password,
      }));
    }

    if (action.type === T.SEND_MESSAGE) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'MESSAGE', text: action.text }));
      }
    }
  }
}

export default function* rootSaga() {
  yield fork(watchAuth);
}
