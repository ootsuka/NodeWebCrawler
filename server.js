const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const app = express();

//socket.io
let server = require('http').Server(app);
let io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('a user connected');
});

server.listen(8080, function () {
    console.log('listening on port 8080');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
