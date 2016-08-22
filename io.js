var io = require('socket.io')();

var userList = new Object();
var userId='';

io.sockets.on('connection', function(socket){
	console.log('클라이언트가 io에 접속하였습니다.');
	

	
	//최초 접속시 userList에 추가
	socket.on('setAttribute',function(data){
		console.log(data);
		userId=data.id;
		userList[userId] = socket.id;
		console.log('소켓 아이디를 등록했습니다 '+socket.id);
	});
	//접속 해제시 userList에서 제거
	socket.on('disconnection', function(){
		console.log('소켓 아이디를 지웠습니다 '+socket.id);
		delete userList[userId];
	});
	//친구 요청이 들어올 시
	socket.on('sendFriendRequest', function(data){
		var fromId=data.fromId; //요청한 아이디
		var toId = data.toId; //요청받는 아이디
		var socketId = userList[toId]; //요청받는 아이디의 소켓아이디 추출
		console.log('io로 친구요청이 들어왔습니다 : '+JSON.stringify(data));
		io.sockets.to(socketId).emit('recieveFriendRequest', fromId);
	});
	
	
	
	
});





module.exports = io;