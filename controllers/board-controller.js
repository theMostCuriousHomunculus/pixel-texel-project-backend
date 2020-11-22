const { Board } = require('../models/board-model');

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

const readAllBoards = async function (req, res) {
  try {
    const allBoards = await Board.find().select('founder name sockets').populate({ path: 'founder', select: 'name' });
    res.status(200).json(allBoards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBoard,
  deleteBoard,
  readAllBoards
};