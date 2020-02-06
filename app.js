const http = require('http');
const socketIo = require("socket.io");        // web socket external module
const uuid = require('uuid/v1');

const port = process.env.PORT || 3000;

// const server = http.createServer((req, res) => {
//   //   res.statusCode = 200;
//   //   res.setHeader('Content-Type', 'text/html');
//   //   res.end('<h1>Hello World.</h1>');
//   res.writeHead(302, {'Location': 'https://hcc1232001.github.io/playground/#/game'});
//   res.end();
// });


const PlayerStatus = {
  idle: 0,
  joined: 1,
  started: 2,
  ended: 4,
  blocked: 3,
}
const playersPerRoom = 3;
const socketServer = socketIo.listen(port);
console.log(`Server running at port `+port);

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
        joined: false,
        status: PlayerStatus.idle
      };
    }
    roomList[socket.id] = players;
    socket.emit('playersInfo', players);
  })

  socket.on('joinRoom', (playerId) => {
    // this is a player instance
    // compare the player id and assign to the room
    console.log('a player is trying to connect, playerId: ' + playerId);
    // use to break nested loop
    // loopRoomList:
    for (let roomId in roomList) {
      const playersInfo = roomList[roomId];
      for (let i = 0; i < playersInfo.length; i++) {
        if (playersInfo[i]['playerId'] === playerId) {
          if (playersInfo[i]['socket'] === null && playersInfo[i]['status'] === PlayerStatus.idle) {
            playersInfo[i]['socket'] = socket;
            playersInfo[i]['joined'] = true;
            playersInfo[i]['status'] = PlayerStatus.joined;
            playersInfo[i]['shakeCount'] = 0;
            playerInRoom[socket.id] = roomId;
            console.log('room assigned');
            socket.emit('msg', 'room assigned');
            socket.emit('playerStatus', {
              status: 'IDLE'
            });
          } else {
            // ignore it since someone get the space already
            //
            console.log('no room found');
            console.log('socket status: ' + (playersInfo[i]['socket'] === null ? 'null': 'not null'));
            console.log('player ' + i + ' status: ' + (playersInfo[i]['status'] === PlayerStatus.idle ? 'idle': playersInfo[i]['status']));
            socket.emit('msg', 'no room found');
            socket.emit('playerStatus', {
              roomJoined: false
            });
            socket.disconnect();
          }
          // console.log(roomId, socketServer.sockets.connected[roomId]);
          // socketServer.sockets.connected[roomId].emit('playersInfo', playersInfo);
          socketServer.sockets.connected[roomId].emit('playersInfo', JSON.parse(
            JSON.stringify(playersInfo, (key, val) => key === 'socket'? undefined: val)
          ));
          // can use to break nested loop
          // break loopRoomList;
          return;
        }
      }
    }
    // no room found for the user id
    socket.emit('msg', 'no player data found for playerId: ', playerId);    
    socket.emit('playerStatus', {
      roomJoined: false
    });
    socket.disconnect();
  })

  socket.on('startGame', () => {
    const roomId = playerInRoom[socket.id];
    if (roomId) {
      const playersInfo = roomList[roomId];
      for (let i = 0; i < playersInfo.length; i++) {
        if (playersInfo[i]['status'] === PlayerStatus.joined) {
          playersInfo[i]['status'] === PlayerStatus.started;
          playersInfo[i]['socket'].emit('gameStart');
        } else {
          playersInfo[i]['socket'].emit('gameSkip');
        }
      }
    }
  })

  socket.on('endGame', () => {
    const roomId = playerInRoom[socket.id];
    if (roomId) {
      const playersInfo = roomList[roomId];
      for (let i = 0; i < playersInfo.length; i++) {
        playersInfo[i]['status'] === PlayerStatus.ended;
      }
    }
  })

  socket.on('shake', () => {
    const roomId = playerInRoom[socket.id];
    console.log(roomId);
    const playersInfo = roomList[roomId];
    console.log(playersInfo);
    if (playersInfo) {
      for (let i = 0; i < playersInfo.length; i++) {
        if (playersInfo[i]['socket'] === socket && playersInfo[i]['status'] === PlayerStatus.started) {
          playersInfo[i]['shakeCount']++;
          socketServer.sockets.connected[roomId].emit('playersInfo', JSON.parse(
            JSON.stringify(playersInfo, (key, val) => key === 'socket'? undefined: val)
          ));
          break;
        }
      }
    }
  })
  socket.on('disconnect', () => {
    console.log('player disconnected');
    if (roomList[socket.id]) {
      // this is a game host
      // TODO: disconnect all user in this room?
      const playersInfo = roomList[socket.id];
      for (let i = 0; i < playersInfo.length; i++) {
        const player = playersInfo[i];
        if (player['socket']) {
          const playerId = player['socket'].id;
          player['socket'].disconnect();
          // player['socket'] = null;
          // player['joined'] = false;
          // player['shakeCount'] = 0;
          // delete playerInRoom[playerId];
        }
      }
    } else if (playerInRoom[socket.id]) {
      // this is a player, tell the game host disconnected?
      const roomId = playerInRoom[socket.id];
      const playersInfo = roomList[roomId];
      for (let i = 0; i < playersInfo.length; i++) {
        const player = playersInfo[i];
        if (player['socket'] === socket) {
          player['socket'] = null;
          player['joined'] = false;
          player['shakeCount'] = 0;
          player['status'] = PlayerStatus.idle;
          break;
        }
      }
      // socketServer.sockets.connected[roomId].emit('playersInfo', playersInfo);
      if (socketServer.sockets.connected[roomId]) {
        // if the player is kicked by the host, room socket will be null
        socketServer.sockets.connected[roomId].emit('playersInfo', JSON.parse(
          JSON.stringify(playersInfo, (key, val) => key === 'socket'? undefined: val)
        ));
      }
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