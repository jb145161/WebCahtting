//클라이언트로 들어오는 io처리를 맡음
var socket = io.connect();
$( document ).ready(function(){
	
	var id = getCookie('id');
	socket.emit('setAttribute', {id:id});
	//친구요청을 io로 읽어옴
	socket.on('recieveFriendRequest', function(data){
		var count = Number($('#friendRequestCount').text());
		count +=1;
		$('#friendRequestCount').text(count);
		var appendHtml = '<tr>'+
							'<td>'+data+'</td><td></td><td>'+new Date()+'</td><td><button class="acceptBtn"'+
							'target="'+data+'">수락</button></td>'+
						 '</tr>';
		$('#requestList tr').first().after(appendHtml); //통신을 통해 들어온 요청을 제일 상단에
	});
	//친구요청 수락을 io로 읽어옴
	socket.on('receiveAcceptFriend',function(id){
		var count = Number($('#friendAcceptCount').text());
		count +=1;
		$('#friendAcceptCount').text(count);
		//유저의 정보를 읽어오는 요청
		$.ajax({
			type:"POST",
			url:"./ajax/readUserInfo",
			data : {id : id},
			dataType : "json",
			success: function(data){
				var name = data[0].name;
				var id = data[0].id;
				var appendHtml = '<tr>'+
									'<td class="openChatting" target="'+id+'" roomNum=-1>'+name+'</td>'
								 '</tr>'
				$('#friendList tr').first().after(appendHtml); //통신을 통해 들어온 요청을 제일 상단에
			},
			error: function(xhr, status, error) {
				alert(error);
			}   
		});
	});
	//io를 통해서 새로운 방 생성 번호를 알려줌
	socket.on('receiveNewRoomNum', function(data){
		alert(JSON.stringify(data));
		var roomNum = data.roomNum;
		var targetId = data.id;
		//td태그 중 target속성이 해당 아이디인 tr태그 검색
		$('#friendList td').each(function(index){
			var object = $('#friendList td').eq(index);
			var target = object.attr('target');
			if(target==targetId){
				$(this).attr('roomnum', roomNum);
				return false;	//break;
			}
		});

	});
	//메세지 들어오면 발생하는 이벤트
	socket.on('receiveMessage', function(data){
		alert('메세지 도착 : '+JSON.stringify(data));
	});
	//해당하는 채팅창에 존재할 때 메세지가 들어오면 발생하는 이벤트
	socket.on('receiveMessageToRoom', function(data){
		alert('채팅 중 메세지 도착 : '+JSON.stringify(data));
		readMessage();	//clickevent메소드. 서버로 ajax 요청을 통해 읽었다는 사실 전달
		var unreadCount = data.unreadPeople.split('||').length;
		$('#chattingArea').append('<div>'+data.name+'<span class="label label-success">'+new Date()+'</span>'+'</div>');
		$('#chattingArea').append('<pre>'+data.message+'<span class="label label-warning unreadCount">'+unreadCount+'</span></pre>');
		$('#chattingArea').scrollTop($('#chattingArea').prop('scrollHeight'));
		var unreadPeopleIdArray = data.unreadPeople.split('||');
		var myId = getCookie('id');
		unreadPeopleIdArray.forEach(function(id, index){	//자신이 읽었던 메세지인지 확인
			if(myId == id){
				var roomNum = $('#myModalLabel').attr('roomnum');
				discountUnreadInRoom(roomNum);	//IO를 통해 지금 방에 있는 사람들에게 unreadCount를 -1
				return false;	//forEach break;
			}
		});
		
	});
	//IO를 통해 받으면 지금 방에 있는 사람들에게 제일 최근 메세지의 unreadCount를 -1
	socket.on('discountUnreadInRoom', function(data){
		alert('현재 방의 메세지 안읽음 수를 전부 -1 해달라는 요청을 받았습니다.');
		var unreadCount = $('.unreadCount').last().text();
		unreadCount -= 1;
		$('.unreadCount').last().text(unreadCount);
	});
	//IO를 통해 받으면 입장한 방에 있는 사람들에게 내가 안읽은 메세지들의 unreadCount 를 -1
	socket.on('discountUnread', function(count){
		alert('입장한 사람이 메세지를 '+count+'개 읽었습니다.');
		var index = $('.unreadCount').index($('.unreadCount:last'));	//마지막 채팅 인덱스
		for(var i = 0; i<count; i++){
			var unreadCount = $('.unreadCount').eq(index).text();
			unreadCount -= 1;
			$('.unreadCount').eq(index).text(unreadCount);
			--index;
		}
	});
	
});
//IO를 통해 방에 입장해서 안읽은 메세지들에 대해서 안읽음 표시를 discount 해줄 것 요청
function discountUnread(roomNum, count){
	socket.emit('discountUnread', {roomNum : roomNum, count : count});
}
//IO를 통해 지금 방에 있는 사람들에게 unreadCount를 -1
function discountUnreadInRoom(roomNum){
	socket.emit('discountUnreadInRoom', {roomNum : roomNum});
}
//io로 서버에 roomNum socket에 들어가겠다고 요청
function joinRoom(roomNum, id){
	socket.emit('joinRoom', {roomNum : roomNum, id : id});
}
//ioEvent메소드. 서버에 메세지 전송
function sendMessageToIO(id, roomNum, message, unreadPeople){
	var name = decodeURIComponent(getCookie('name'));	//cookie에 있는 값 decode
	socket.emit('sendMessageToIO', {id : id, name : name, roomNum : roomNum,
		message : message, unreadPeople: unreadPeople});
}
//io로 서버에 roomNum socekt 방을 나가겠다고 요청
function leaveRoom(roomNum, id){
	socket.emit('leaveRoom', {roomNum : roomNum, id : id});
}
//clickevent로부터 이벤트를 받아 서버로 새로운 방 생성 번호를 보낸다.
function sendNewRoomNum(roomNum, target){
	var id = getCookie('id');
	socket.emit('sendNewRoomNum', {roomNum : roomNum, target : target, id : id})
}
//clickevent 로부터 이벤트를 받아 서버로 친구요청을 보낸다.
function sendFriendRequest(toId){
	var fromId = getCookie('id');
	socket.emit('sendFriendRequest', {toId:toId,
										fromId:fromId});
	
}
//clickevent로부터 이벤트를 받아 친구가 요청을 수락하였음을 알린다.
function sendAcceptFriend(fromId, toId){
	socket.emit('sendAcceptFriend', {fromId:fromId, toId:toId});
}

//서버로 ajax 요청을 통해 읽었다는 사실 전달
function readMessage(){
	var roomNum = $('#myModalLabel').attr('roomnum');
	var id = getCookie('id');
	var count = 0;
	$.ajax({
		type:"POST",
		url:"./ajax/readMessage",
		data : {roomNum : roomNum,
				id : id},
		dataType : "json",
		success: function(data){
			if(data.result=='success'){
				alert('readMessage ajax 성공 count = '+data.count);
				count = data.count;
				alert(count +' 를 리턴합니다');
				return count;
			}
		},
		error: function(xhr, status, error) {
			alert(error);
		}   
	});
	
	
}

function closeIt(){
	socket.emit('disconnection');
}

// cName의 key를 갖는 cookie 값 value 추출
function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
         start += cName.length;
         var end = cookieData.indexOf(';', start);
         if(end == -1)end = cookieData.length;
         cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}