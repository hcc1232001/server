const http = require('http');
const socketIo = require("socket.io");        // web socket external module

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World</h1>');
});

server.listen(port,() => {
  console.log(`Server running at port `+port);
});

const socketServer = socketIo.listen(server);
socketServer.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('registerPresenter', (projectData) => {
    console.log('presenter connected');
    presenter = socket;
    socket.emit('serverMsg', 'You are now presenter');
    // console.log(getIp());
    presenter.emit('updateViewerCount', viewer.length);
  });
  socket.on('registerViewer', () => {
    console.log('viewer connected');
    socket.emit('serverMsg', 'You are now viewer');
    viewer.push(socket);
    // console.log(sceneData);
    if (sceneData) {
      socket.emit('updateSceneData', sceneData);
    }
    if (presenter) {
      presenter.emit('updateViewerCount', viewer.length);
    }
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    if (socket !== presenter) {
      viewer = viewer.filter((val, idx, arr) => {
        return val !== socket;
      })
      presenter.emit('updateViewerCount', viewer.length);
    }
  });
  socket.on('test', (data) => {
    console.log('test');
    if (presenter === socket) {
      // only let presenter send msg
      // if (data.action === "hello") {
        socket.broadcast.emit('test', data);          
      // }
    }
  });