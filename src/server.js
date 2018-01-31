const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const app = express();

//socket.io
let server = require('http').Server(app);
let io = require('socket.io')(server);

server.listen(8080, function () {
    console.log('listening on port 8080');
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/build/index.html');
})

io.on('connection', function (socket) {
  console.log('a user connected');
})
