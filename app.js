const http = require('http');
const socketIo = require("socket.io");        // web socket external module

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World. ' + port + '</h1>');
});

server.listen(port,() => {
  console.log(`Server running at port `+port);
});

const socketServer = socketIo.listen(server);
// const socketServer = socketIo.listen(port);

let player = [];
socketServer.on('connection', (socket) => {
  console.log('a player connected');
  player.push(socket);
  socketServer.sockets.emit('updatePlayerCount', player.length);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    player = player.filter((val, idx, arr) => {
      return val !== socket;
    })
    socketServer.sockets.emit('updatePlayerCount', player.length);
  });
  socket.on('test', (data) => {
    console.log('test');
    socket.broadcast.emit('test', data);
  });
});