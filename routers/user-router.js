const { Router } = require('express');

const authorized = require('../middleware/authorized');
const {
  login,
  logout,
  register
} = require('../controllers/user-controller');

const router = new Router();

router.patch('/login', login);

router.patch('/logout', authorized, logout);

router.post('/', register);