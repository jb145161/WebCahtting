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
	
});
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

function closeIt(){
	socket.emit('disconnection');
}

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