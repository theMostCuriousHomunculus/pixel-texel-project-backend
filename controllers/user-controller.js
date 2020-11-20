const { User } = require('../models/user-model');

async function login (req, res) {
  // this route is not protected (i.e. has not gone through any middleware) so the user account has not been attached to req yet
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthenticationToken();
    res.status(200).header('Authorization', `Bearer ${token}`).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function logout (req, res) {
  // this route is protected (i.e. has gone through middleware) so the user account has already been attached to req
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({ message: 'Successfully logged out on all devices!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function register (req, res) {
  // this route is not protected (i.e. has not gone through any middleware) so the user account has not been attached to req yet
  const { email, name, password } = req.body;
  const user = new User({ email, name, password });
  try {
    await user.save();
    const token = await user.generateAuthenticationToken();
    res.status(201).header('Authorization', `Bearer ${token}`).json({ token, userId: user._id });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  logout,
  register
};