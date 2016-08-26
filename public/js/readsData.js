//제일 처음 접속 했을 시에 나열하는 데이터들

$( document ).ready(function(){
	//접속한 유저의 아이디
	var id = getCookie('id');
	//해당하는 유저에게 온 친구요청을 모두 읽어옴
	$.ajax({
		type:"POST",
		url:"/ajax/readRequests",
		data : {id : id},
		dataType : "json",
		success: function(data){
			$.each(data, function(index, object){
				var appendHtml = '<tr num="'+object.requestNum+'">'+
				'<td>'+object.fromId+'</td><td></td><td>'+object.requestDate
				+'</td><td><button class="acceptBtn"'+
				'target="'+object.fromId+'">수락</button></td>'+
				'</tr>';

				$('#requestList').append(appendHtml);
			});
		},
		error: function(xhr, status, error) {
			alert(error);
		}   
	});
	//해당하는 유저의 친구목록을 모두 읽어옴
	$.ajax({
		type:"POST",
		url:"/ajax/readFriends",
		data : {id : id},
		dataType : "json",
		success: function(data){
			$.each(data, function(index, object){
				var appendHtml = '<tr>'+
				'<td class="openChatting" target="'+object.myfriendsid+'" roomNum='
				+object.roomnum+'>'+object.myfriendname+'</td>'+
				'</tr>';
				$('#friendListTable').append(appendHtml);
			});
		},
		error: function(xhr, status, error) {
			alert(error);
		}   
	});
	//제일 처음 접속하면 채팅 방 리스트들 나열
	$.ajax({
		type:"POST",
		url:"/ajax/readChattingRoomList",
		data : {id : id},
		dataType : "json",
		success: function(data){
			alert(JSON.stringify(data));
		},
		error: function(xhr, status, error) {
			alert(error);
		}   
	});
	
});