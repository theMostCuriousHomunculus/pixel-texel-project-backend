const jwt = require('jsonwebtoken');

const { User } = require('../models/user-model');

const authenticated = async function (req, res, next) {
  try {
    if (req.method === 'OPTIONS') return next();
    
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) throw new Error('You must be logged in to perform this action.');

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': token });

    if (!user) throw new Error('You must be logged in to perform this action.');

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = authenticated;