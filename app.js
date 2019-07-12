const http = require('http');
const socketIo = require("socket.io");        // web socket external module
const uuid = require('uuid/v1');

const port = process.env.PORT || 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/html');
//   res.end('<h1>Hello World.</h1>');
// });

// server.listen(port,() => {
//   console.log(`Server running at port `+port);
// });

// const socketServer = socketIo.listen(server);
const playersPerRoom = 3;
const socketServer = socketIo.listen(port);

let roomList = {};
let playerInRoom = {};
socketServer.on('connection', (socket) => {
  // somebody connected
  // maybe game host instance or player instance

  socket.on('createRoom', () => {
    // this is a game host instance
    // generate user ids and pass back to the frontend
    const players = [];
    for (let i = 0; i < playersPerRoom; i++) {
      players[i] = {
        playerId: uuid(),
        socket: null,
        joined: false
      };
    }
    roomList[socket.id] = players;
    socket.emit('playersInfo', players);
  })

  socket.on('joinRoom', (playerId) => {
    // this is a player instance
    // compare the player id and assign to the room
    console.log('a player connected, playerId: ' + playerId);
    // player.push(socket);
    // Object.keys(roomList).forEach(roomId => {
    loopRoomList:
    for (let roomId in roomList) {
      const playersInfo = roomList[roomId];
      for (let i = 0; i < playersInfo.length; i++) {
        if (playersInfo[i]['playerId'] === playerId) {
          if (playersInfo[i]['socket'] === null) {
            playersInfo[i]['socket'] = socket;
            playersInfo[i]['joined'] = true;
            playerInRoom[socket.id] = roomId;
            console.log('room assigned');
          } else {
            // ignore it since someone get the space already
            //
            console.log('no room found');
          }
          console.log(roomId, socketServer.sockets.connected[roomId]);
          socketServer.sockets.connected[roomId].emit('playersInfo', playersInfo);
          break loopRoomList;
        }
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('player disconnected');
    if (roomList[socket.id]) {
      // this is a game host
      // TODO: disconnect all user in this room?

    } else if (playerInRoom[socket.id]) {
      // this is a player, tell the game host disconnected?
      const roomId = playerInRoom[socket.id];
      const playersInfo = roomList[roomId];
      for (let i = 0; i < playersInfo.length; i++) {
        const player = playersInfo[i];
        if (player['socket'] === socket) {
          player['socket'] = null;
          player['joined'] = false;
          break;
        }
      }
      socketServer.sockets.connected[roomId].emit('playersInfo', playersInfo);
      delete playerInRoom[socket.id];
    }
    // player = player.filter((val, idx, arr) => {
    //   return val !== socket;
    // })
    // socketServer.sockets.emit('updatePlayerCount', player.length);

    // socket.leave(roomId)
  });
});



// socketServer.sockets.connected[socketId]