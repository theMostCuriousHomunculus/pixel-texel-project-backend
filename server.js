// built in node modules
const http = require('http');

// npm dependencies
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');

// exports from other project files
const boardRouter = require('./routers/board-router');
const userRouter = require('./routers/user-router');

mongoose.connect(process.env.DB_CONNECTION, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, PATCH, POST');
  next();
});
app.use(express.urlencoded({
  extended: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}));

app.use('/api/board', boardRouter(io));
app.use('/api/user', userRouter);

app.use(function (req, res) {
  res.status(404).json({ message: 'The page you are looking for does not exist.' });
});

server.listen(port = process.env.PORT, function () {
    console.log(`Server is up on port ${port}.`);
});