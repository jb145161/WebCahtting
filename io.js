var io = require('socket.io')();

io.sockets.on('connection', function(socket){
	console.log('클라이언트가 io에 접속하였습니다.');
});



module.exports = io;