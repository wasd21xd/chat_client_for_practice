import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import chatReducer from './reducer';
import rootSaga from '../sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(chatReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
