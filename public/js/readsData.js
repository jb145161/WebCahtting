//제일 처음 접속 했을 시에 나열하는 데이터들

$( document ).ready(function(){
	var id = getCookie('id');
	$.ajax({
		type:"POST",
		url:"/ajax/readRequests",
		data : {id : id},
		dataType : "json",
		success: function(data){
			for(var requestObject in data){
				var appendHtml = '<tr>'+
				'<td>'+data[requestObject].fromId+'</td><td></td><td>'+data[requestObject].requestDate+'</td><td><button class="acceptBtn"'+
				'target="'+data[requestObject].fromId+'" onclick="acceptFriend('+data[requestObject].fromId+')">수락</button></td>'+
				'</tr>';

				$('#requestList').append(appendHtml);
			}
		},
		error: function(xhr, status, error) {
			alert(error);
		}   
	});
});