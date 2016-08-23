var io = require('socket.io')();

var userList = new Array();


io.sockets.on('connection', function(socket){
	console.log('클라이언트가 io에 접속하였습니다.');
	
userList.get = function(id){
	for(var key in userList){
		if(userList[key].id==id){
			return userList[key];
		}
	}
}
userList.remove = function(socket){
	for(var key in userList){
		if(userList[key].socketId==socket.id){
			userList.pop(key);
		}
	}
}
	
	//최초 접속시 userList에 추가
	socket.on('setAttribute',function(data){
		console.log(data);
		var userObject = new Object();
		var userId=data.id;
		userObject.id = userId;
		userObject.socketId = socket.id;
		userList.push(userObject);
		console.log('소켓 아이디를 등록했습니다 '+socket.id);
		console.log('현재 리스트');
		console.log(JSON.stringify(userList));
	});
	//접속 해제시 userList에서 제거
	socket.on('disconnection', function(){
		userList.remove(socket);
		console.log('소켓 아이디를 지웠습니다 '+socket.id);
		console.log('현재 리스트');
		console.log(JSON.stringify(userList));
		
	});
	//친구 요청이 들어올 시
	socket.on('sendFriendRequest', function(data){
		var fromId=data.fromId; //요청한 아이디
		var toId = data.toId; //요청받는 아이디
		var socketId = userList.get(toId).socketId; //요청받는 아이디의 소켓아이디 추출
		console.log('io로 친구요청이 들어왔습니다 : '+JSON.stringify(data));
		io.sockets.to(socketId).emit('recieveFriendRequest', fromId);
	});
	socket.on('sendAcceptFriend', function(data){
		var fromId=data.fromId; //요청한 아이디(이 아이디에 친구가 요청 수락했음을 알림)
		var toId = data.toId; //요청받는 아이디
		console.log('fromId '+fromId);
		console.log('toId '+toId);
		var socketIdfrom = userList.get(fromId).socketId;
		var socketIdto = userList.get(toId).socketId;
		console.log('io로 친구요청이 수락되었다는 결과가 들어왔습니다 : '+JSON.stringify(data));
		//수락한 쪽과 수락받은 쪽 모두에게 실시간으로 추가 사실 알림
		io.sockets.to(socketIdfrom).emit('receiveAcceptFriend', toId);
		console.log(socketIdfrom+'으로 보냄');
		io.sockets.to(socketIdto).emit('receiveAcceptFriend', fromId);
		console.log(socketIdto+'으로 보냄');
	});
	
	
	
	
});



module.exports = io;