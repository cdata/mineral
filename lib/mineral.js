var express = require('express');
var http = require('http');
var argv = require('optimist').argv;
var MC = require('./mc');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var mc = new MC({
  jarPath: argv.j,
  clientName: argv.u,
  clientPassword: argv.p
});

process.on('uncaughtException', function(e) {
  console.log(e.stack);
  mc.stop().then(function() {
    process.exit(1);
  });
});

mc.start();

app.use(express.static('../static'));

io.on('connection', function(socket) {
  socket.join('mineral');
  socket.emit('minecraft:players', mc.getPlayerList());
  socket.on('mineral:chat', function(message) {
    mc.sendMessage(message);
  });
});

mc.on('chat', function(message) {
  io.sockets.in('mineral').emit('minecraft:chat', message);
});

mc.on('playerListUpdate', function(list) {
  io.sockets.in('mineral').emit('minecraft:players', list);
});

server.listen(8001);
