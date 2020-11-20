const { Router } = require('express');

const authenticated = require('../middleware/authenticated');
const authorized = require('../middleware/authorized');
const {
  createBoard,
  deleteBoard,
  deleteMessage,
  editMessage,
  joinBoard,
  leaveBoard,
  readAllBoards,
  sendMessage
} = require('../controllers/board-controller');

const router = new Router();

const routerWithSocketIO = function (io) {

  router.delete('/:boardId', authorized, deleteBoard);

  router.delete('/:boardId/:messageId', authorized, deleteMessage);

  router.get('/', readAllBoards);

  router.patch('/:boardId/:messageId', authorized, editMessage);

  router.post('/', authenticated, createBoard);

  io.on('connect', function (socket) {

    socket.on('join', joinBoard);

    socket.on('sendMessage', sendMessage);

    socket.on('leave', leaveBoard);

  });

  return router;
};

module.exports = routerWithSocketIO;