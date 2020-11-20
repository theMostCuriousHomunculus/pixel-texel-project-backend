const jwt = require('jsonwebtoken');

const { User } = require('../models/user-model');
const { Board } = require('../models/board-model');

const authorized = async function (req, res, next) {
  try {
    if (req.method === 'OPTIONS') return next();

    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) throw new Error('You must be logged in to perform this action.');

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': token });

    if (!user) throw new Error('You are do not have permission to perform the requested action.');

    if (req.params.messageId) {
      const board = await Board.findById(req.params.boardId);

      if (!board) throw new Error('Could not find a message board with that ID.');

      const message = board.messages.id(req.params.messageId);

      if (!message) throw new Error('Could not find a message with that ID.');

      if (!user._id.equals(message.author)) throw new Error('You do not have permission to perform the requested action.');

      req.board = board;
      req.message = message;
      req.user = user;
      return next();
    }

    if (req.params.boardId) {
      const board = await Board.findById(req.params.boardId);

      if (!board) throw new Error('Could not find a message board with that ID.');

      if (!user._id.equals(board.founder)) throw new Error('You do not have permission to perform the requested action.');
      
      req.board = board;
      req.user = user;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = authorized;