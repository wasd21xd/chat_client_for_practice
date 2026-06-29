import * as T from './actionTypes';

const initialState = {
  connected: false,
  myId: null,
  myUsername: null,
  myColor: null,
  authError: null,
  users: [],
  messages: [],
};

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    case T.WS_CONNECTED:
      return { ...state, connected: true, authError: null };
    case T.WS_DISCONNECTED:
      return { ...state, connected: false };
    case T.AUTH_ERROR:
      return { ...state, authError: action.message };
    case T.SET_MY_INFO:
      return { ...state, myId: action.info.id, myUsername: action.info.username, myColor: action.info.color, authError: null };
    case T.UPDATE_USERS:
      return { ...state, users: action.users };
    case T.LOAD_HISTORY:
      return { ...state, messages: action.messages.map(m => ({ ...m, type: 'message' })) };
    case T.RECEIVE_MESSAGE:
      return { ...state, messages: [...state.messages, { ...action.msg, type: 'message' }] };
    case T.RECEIVE_SYSTEM:
      return { ...state, messages: [...state.messages, { id: Date.now(), type: 'system', text: action.msg.text, timestamp: action.msg.timestamp }] };
    default:
      return state;
  }
}
