var io = require('socket.io')();

var userList = new Array();
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
			console.log('지워야하는 소켓 아이디 = '+socket.id);
			console.log(key+'번째 소켓 아이디를 지웠습니다 '+userList[key].socketId);
			userList.splice(key,1);
			break;
		}
	}
}


io.sockets.on('connection', function(socket){
	console.log('클라이언트가 io에 접속하였습니다.');
	

	
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
		console.log('현재 리스트');
		console.log(JSON.stringify(userList));
		
	});
	//채팅 방 소켓에 들어올 시
	socket.on('joinRoom', function(data){
		var roomNum = data.roomNum;
		var id = data.id;
		//소켓멤버 조인
		socket.join(roomNum);
		console.log(id+'님이 '+roomNum+'번 소켓멤버로 join했습니다.');
	});
	//채팅 방 소켓에 나갈 시
	socket.on('leaveRoom', function(data){
		var roomNum = data.roomNum;
		var id = data.id;
		//소켓멤버 조인
		socket.leave(roomNum);
		console.log(id+'님이 '+roomNum+'번 소켓멤버를 leave했습니다.');
	});
	//친구 요청이 들어올 시
	socket.on('sendFriendRequest', function(data){
		var fromId=data.fromId; //요청한 아이디
		var toId = data.toId; //요청받는 아이디
		console.log('io로 친구요청이 들어왔습니다 : '+JSON.stringify(data));
		var userObject = userList.get(toId);
		if(userObject != undefined){
			var socketId = userList.get(toId).socketId; //요청받는 아이디의 소켓아이디 추출
			io.sockets.to(socketId).emit('recieveFriendRequest', fromId);
		}
		
	});
	//친구요청 수락 시
	socket.on('sendAcceptFriend', function(data){
		console.log('io로 친구요청이 수락되었다는 결과가 들어왔습니다 : '+JSON.stringify(data));
		var fromId=data.fromId; //요청한 아이디(이 아이디에 친구가 요청 수락했음을 알림)
		var toId = data.toId; //요청받는 아이디
		

		//수락한 쪽과 수락받은 쪽 모두에게 실시간으로 추가 사실 알림
		var userToObject = userList.get(toId);
		if(userToObject != undefined){
			var socketIdto = userList.get(toId).socketId;
			io.sockets.to(socketIdto).emit('receiveAcceptFriend', fromId);
			console.log(fromId+'으로 보냄');
		}
		var userFromObject = userList.get(toId);
		if(userFromObject != undefined){
			var socketIdfrom = userList.get(fromId).socketId;
			io.sockets.to(socketIdfrom).emit('receiveAcceptFriend', toId);
			console.log(toId+'으로 보냄');
		}	
	});
	//새로운 방 생성 번호를 알리는 요청
	socket.on('sendNewRoomNum', function(data){
		console.log('io로 새로운 방 생성 번호를 알리는 요청이 들어왔습니다. :'+JSON.stringify(data));
		var target = data.target;
		var roomNum = data.roomNum;
		var id = data.id
		var userObject = userList.get(target);
		if(userObject != undefined){
			var socketId = userObject.socketId;
			io.sockets.to(socketId).emit('receiveNewRoomNum', data);
			console.log(target+'으로 보냄');
		}
		//소켓멤버 조인
		socket.join(roomNum);
		console.log(id+'님이 '+roomNum+'번 소켓멤버로 join했습니다.');
	});
	
	//메세지 전송 요청
	socket.on('sendMessageToIO', function(data){
		console.log('io로 메세지 전송 요청이 들어왔습니다 : '+JSON.stringify(data));
		var roomNum = data.roomNum;
		io.sockets.in(roomNum).emit('receiveMessageToRoom', data);	//채팅창을 열고 대화하는
																	//사람들을 대상으로 이벤트 전송
		var unreadPeople = data.unreadPeople;
		unreadPepleIdArray = unreadPeople.split('||');	
		unreadPepleIdArray.forEach(function(id, index){
			var userObject = userList.get(id);
			if(userObject != undefined){
				var socketId = userObject.socketId;
				io.sockets.to(socketId).emit('receiveMessage', data);
			}
		});
	});
	//IO를 통해 지금 방에 있는 사람들에게 unreadCount를 -1
	socket.on('discountUnreadInRoom', function(data){
		console.log('io로 메세지 안읽음 수를 줄여달라는 요청이 왔습니다.');
		var roomNum = data.roomNum;
		io.sockets.in(roomNum).emit('discountUnreadInRoom');  //지금 방에 있는 사람들에게 unreadCount를 -1
	});
	//IO를 통해 방에 입장해서 안읽은 메세지들에 대해서 안읽음 표시를 discount 해줄 것 요청
	socket.on('discountUnread', function(data){
		var roomNum = data.roomNum;
		var count = data.count;
		console.log('io로 새로 방에 들어가서 메세지를 읽었으니, 메세지 안읽음 수를 줄여달라는 요청이 왔습니다.');
		console.log('data = '+JSON.stringify(data)+'count = '+count);
		io.sockets.in(roomNum).emit('discountUnread', count);
	});
	
	
});



module.exports = io;