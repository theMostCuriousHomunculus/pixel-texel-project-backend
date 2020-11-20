const jwt = require('jsonwebtoken');

const { Board } = require('../models/board-model');
const { User } = require('../models/user-model');

const createBoard = async function (req, res) {
  try {
    const board = new Board({
      founder: req.user._id,
      messages: [],
      name: req.name,
      sockets: []
    });
  
    await board.save();
    res.status(201).json({ _id: board._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBoard = async function (req, res) {
  try {
    await Board.findByIdAndDelete(req.params.boardId);
    const remainingBoards = await Board.find().select('founder name sockets').populate({ path: 'founder', select: 'name' });
    res.status(200).json(remainingBoards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async function (req, res) {
  try {
    req.board.messages = req.board.messages.filter(message => message._id.toString() != req.params.messageId);
    await req.board.save();
    res.status(200).json(req.board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editMessage = async function (req, res) {
  try {
    // lol
    req.message.body = req.body.message;
    await req.message.save();
    res.status(200).json(req.message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinBoard = async function (boardId) {
  try {
    const board = await Board.findById(boardId);
    board.sockets.push(socket.id);
    await board.save();
    await board.populate({ path: 'messages.author', select: 'name' });
    socket.join(boardId);
    socket.emit('admitted', {
      name: board.name,
      messages: board.messages
    });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

const leaveBoard = async function (boardId) {
  try {
    const board = await Board.findById(boardId);
    board.sockets = board.sockets.filter(socketId => socketId != socket.id);
    await board.save();
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

const readAllBoards = async function (req, res) {
  try {
    const allBoards = await Board.find().select('founder name sockets').populate({ path: 'founder', select: 'name' });
    res.status(200).json(allBoards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async function (boardId, token, messageText) {
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
    await newMessage.populate({ path: 'author', select: 'name' });
    io.to(boardId).emit('receiveMessage', newMessage);
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

module.exports = {
  createBoard,
  deleteBoard,
  deleteMessage,
  editMessage,
  joinBoard,
  leaveBoard,
  readAllBoards,
  sendMessage
};