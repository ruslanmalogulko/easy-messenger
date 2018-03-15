var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var isInputProgress = false;
var activeUsers = {};
var activeSockets = {};
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../build')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected', socket.id);
  activeUsers[socket.id] = 'Anonymous';
  activeSockets[socket.id] = socket;
  io.emit('nick change', activeUsers);

  socket.on('disconnect', function() {
    console.log('a user disconnected');
    delete activeUsers[socket.id];
    delete activeSockets[socket.id];
    io.emit('nick change', activeUsers);
  });

  socket.on('chat message', function(msg) {
    io.emit('input indicator stop');
    if (msg.message.indexOf('@') > -1) {
        var startIndex = msg.message.indexOf('@');
        var substr = msg.message.substring(startIndex + 1, msg.message.indexOf(' ', startIndex));
        var socketId = Object.keys(activeUsers)
            .filter(id => activeUsers[id] === substr)[0];
        if (activeSockets[socketId]) {
            channel = activeSockets[socketId];
        } else {
            channel = socket;
            msg.message = '--- There is no such user: ' + substr + ' ---';
        }
    } else {
        channel = socket.broadcast;
    }
    channel.emit('chat message', msg);
  });

  socket.on('input indicator start', function(nick) {
    socket.broadcast.emit('input indicator start', nick);
    clearTimeout(isInputProgress);
    isInputProgress = setTimeout(() => socket.broadcast.emit('input indicator stop'), port);
  });

  socket.on('nick change', function(nick) {
    activeUsers[socket.id] = nick ? nick : 'Anonymous';
    io.emit('nick change', activeUsers);
  })
});

http.listen(port, function(){
  console.log('listening on *:port');
});
