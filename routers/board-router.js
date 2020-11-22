const jwt = require('jsonwebtoken');

const { Router } = require('express');

const authenticated = require('../middleware/authenticated');
const authorized = require('../middleware/authorized');
const {
  createBoard,
  deleteBoard,
  // joinBoard,
  // leaveBoard,
  readAllBoards,
  // sendMessage
} = require('../controllers/board-controller');
const { Board, Message } = require('../models/board-model');
const { User } = require('../models/user-model');

const router = new Router();

const routerWithSocketIO = function (io) {

  // these requests DO NOT utilize the websocket protocol
  router.delete('/:boardId', authorized, deleteBoard);

  router.get('/', readAllBoards);

  router.post('/', authenticated, createBoard);

  // these requests DO utilize the websocket protocol
  io.on('connect', function (socket) {

    socket.on('join', async function (boardId) {
      try {
        const board = await Board.findById(boardId).populate({ path: 'messages.author', select: 'name' }).populate({ path: 'founder', select: 'name' });
        board.sockets.push(socket.id);
        await board.save();
        socket.join(boardId);
        socket.emit('admitted', {
          founder: board.founder,
          messages: board.messages,
          name: board.name
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('sendMessage', async function (boardId, token, messageText) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': token });
    
        if (!user) throw new Error('You must be logged in to perform this action.');
    
        const board = await Board.findById(boardId);
    
        if (!board) throw new Error('Could not find a message board with the provided ID.');
    
        const newMessage = new Message({
          author: user._id,
          body: messageText
        });
        board.messages.push(newMessage);
        await board.save();
        io.to(boardId).emit('receiveMessage', {
          _id: newMessage._id,
          author: {
            _id: user._id,
            name: user.name
          },
          body: messageText,
          createdAt: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('leave', async function (boardId) {
      try {
        const board = await Board.findById(boardId);
        board.sockets = board.sockets.filter(socketId => socketId != socket.id);
        await board.save();
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

  });

  return router;
};

module.exports = routerWithSocketIO;