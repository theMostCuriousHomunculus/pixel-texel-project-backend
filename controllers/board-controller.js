const jwt = require('jsonwebtoken');

const { Board } = require('../models/board-model');
const { User } = require('../models/user-model');

const createBoard = async function (req, res) {
  try {
    const board = new Board({
      founder: req.user._id,
      messages: [],
      name: req.body.name,
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

// const joinBoard = async function (boardId) {
//   try {
//     const board = await Board.findById(boardId);
//     board.sockets.push(this.id);
//     await board.save();
//     await board.populate({ path: 'messages.author', select: 'name' }).populate({ path: 'founder', select: 'name' });
//     this.join(boardId);
//     this.emit('admitted', {
//       founder: board.founder,
//       messages: board.messages,
//       name: board.name
//     });
//   } catch (error) {
//     this.emit('error', { message: error.message });
//   }
// };

// const leaveBoard = async function (boardId) {
//   try {
//     const board = await Board.findById(boardId);
//     board.sockets = board.sockets.filter(socketId => socketId != this.id);
//     await board.save();
//   } catch (error) {
//     this.emit('error', { message: error.message });
//   }
// };

const readAllBoards = async function (req, res) {
  try {
    const allBoards = await Board.find().select('founder name sockets').populate({ path: 'founder', select: 'name' });
    res.status(200).json(allBoards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const sendMessage = async function (boardId, token, messageText) {
//   try {
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': token });

//     if (!user) throw new Error('You must be logged in to perform this action.');

//     const board = await Board.findById(boardId);

//     if (!board) throw new Error('Could not find a message board with the provided ID.');

//     const newMessage = new Message({
//       author: user._id,
//       body: messageText
//     });
//     board.messages.push(newMessage);
//     await board.save();
//     await newMessage.populate({ path: 'author', select: 'name' });
//     io.to(boardId).emit('receiveMessage', newMessage);
//   } catch (error) {
//     this.emit('error', { message: error.message });
//   }
// };

module.exports = {
  createBoard,
  deleteBoard,
  // joinBoard,
  // leaveBoard,
  readAllBoards,
  // sendMessage
};