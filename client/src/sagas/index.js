import { take, put, call, fork, race, cancel } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import * as T from '../store/actionTypes';
import {
  wsConnected,
  wsDisconnected,
  setMyInfo,
  updateUsers,
  receiveMessage,
  receiveSystem,
} from '../store/actions';

const WS_URL =
  process.env.REACT_APP_WS_URL ||
  (window.location.hostname === 'localhost'
    ? 'ws://localhost:8080'
    : `wss://${window.location.hostname.replace('chat-client', 'chat-server')}`);

// Creates a Redux channel that emits WebSocket events
function createSocketChannel(socket) {
  return eventChannel((emit) => {
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        emit(data);
      } catch {
        // ignore malformed
      }
    };
    socket.onclose = () => emit(END);
    socket.onerror = () => emit(END);
    return () => socket.close();
  });
}

function* watchMessages(socket, channel) {
  while (true) {
    const data = yield take(channel);
    switch (data.type) {
      case 'WELCOME':
        yield put(setMyInfo({ id: data.id, username: data.username, color: data.color }));
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

function* handleConnection(action) {
  const { username } = action;
  const socket = new WebSocket(WS_URL);

  yield new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  yield put(wsConnected());
  socket.send(JSON.stringify({ type: 'JOIN', username }));

  const channel = createSocketChannel(socket);
  const messageTask = yield fork(watchMessages, socket, channel);

  // Wait for SEND_MESSAGE actions and forward to WebSocket
  while (true) {
    const { send, disconnect } = yield race({
      send: take(T.SEND_MESSAGE),
      disconnect: take(T.WS_DISCONNECTED),
    });

    if (disconnect) {
      yield cancel(messageTask);
      socket.close();
      break;
    }

    if (send && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'MESSAGE', text: send.text }));
    }
  }
}

function* watchConnection() {
  while (true) {
    const action = yield take(T.SET_USERNAME);
    yield call(handleConnection, action);
    yield put(wsDisconnected());
  }
}

export default function* rootSaga() {
  yield fork(watchConnection);
}
