var socket = io.connect();
$( document ).ready(function(){
	
	var id = getCookie('id');
	socket.emit('setAttribute', {id:id});
	
	socket.on('recieveFriendRequest', function(data){
		var count = Number($('#friendRequestCount').text());
		count +=1;
		$('#friendRequestCount').text(count);
		var appendHtml = '<tr>'+
							'<td>'+data+'</td><td></td><td>'+new Date()+'</td><td><button class="acceptBtn"'+
							'target="'+data+'" onclick="acceptFriend('+data+')">수락</button></td>'+
						 '</tr>';
		$('#requestList tr').first().after(appendHtml); //통신을 통해 들어온 요청을 제일 상단에
	});
	
});

function sendFriendRequest(toId){
	var fromId = getCookie('id');
	alert('실행');
	socket.emit('sendFriendRequest', {toId:toId,
										fromId:fromId});
	
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