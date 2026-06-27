# waveroom 💬

Чат-приложение в реальном времени. Несколько пользователей подключаются к общей комнате и обмениваются сообщениями без перезагрузки страницы.

Проект выбран из каталога: https://github.com/practical-tutorials/project-based-learning  
Туториал: https://www.freecodecamp.org/news/how-to-build-a-chat-application-using-react-redux-redux-saga-and-web-sockets-47423e4bc21a

## Что реализовано

- Ввод имени перед входом в чат
- Real-time обмен сообщениями через WebSocket
- Список активных пользователей в сайдбаре (обновляется при подключении/отключении)
- Системные сообщения о входе и выходе участников
- Сообщения отправителя отображаются справа, остальных — слева
- Уникальный цвет у каждого пользователя

## Стек

| Часть | Технология |
|---|---|
| Frontend | React 18, Redux 4, Redux-Saga |
| Транспорт | WebSocket (браузерный API + библиотека `ws`) |
| Backend | Node.js |
| Деплой клиента | Vercel |
| Деплой сервера | Render |

## Ссылки

- **Деплой (клиент):** https://chat-client-for-practice.vercel.app
- **Сервер (WebSocket):** https://chat-client-for-practice.onrender.com
- **Репозиторий:** https://github.com/wasd21xd/ВАШ_РЕП ← замени на свою ссылку

## Code Climate

[![Maintainability](https://api.codeclimate.com/v1/badges/REPLACE/maintainability)](https://codeclimate.com/github/wasd21xd/ВАШ_РЕП) ← замени после подключения

## Как запустить локально

**Сервер:**
```bash
cd server
npm install
npm start
# WebSocket запустится на ws://localhost:8080
```

**Клиент** (в отдельном терминале):
```bash
cd client
npm install
npm start
# Откроется http://localhost:3000
```

Для теста чата открой вторую вкладку в режиме инкогнито и войди под другим именем.
