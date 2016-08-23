//탭 클릭 이벤트
$( document ).ready(function(){
	$('#myTab a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});


	$('#chatts').click(function(e){
//		$.ajax({
//		type:"POST",
//		url:"./book.jsp",
//		data : {name : "홍길동"},
//		dataType : "xml",
//		success: function(xml){
//		console.log(xml);
//		},
//		error: function(xhr, status, error) {
//		alert(error);
//		}   
//		});
	});
	$('#friendLists').click(function(e){
		$('#friendAcceptCount').text('');
	});
	$('#message').click(function(e){
		$('#friendRequestCount').text('');
	});

	//친구 찾기 버튼 이벤트
	$('#findFriendBtn').click(function(e){
		e.preventDefault();
		var id = $('#findID').val();
		$.ajax({
			type:"POST",
			url:"./ajax/findFriend",
			data : {id : id},
			dataType : "json",
			success: function(data){
				alert(JSON.stringify(data));
				if(data.length == 0){
					alert('해당하는 유저가 존재하지 않습니다.');
				}else{
					$('#friendRequest').show();
					$('#findIDResult').text(data[0].id);
				}
//				$btn.button('reset');
			},
			error: function(xhr, status, error) {
				alert(error);
			}   
		});
		
	});
	
	$('#friendRequest').hide();
	//친구요청 버튼 클릭 이벤트
	$('#friendRequest').click(function(e){
		var findIDResult = $('#findIDResult').text();
		$.ajax({
			type:"POST",
			url:"./ajax/friendRequest",
			data : {findIDResult : findIDResult},
			success: function(data){
				if(data=='success'){
					alert(data);
					//ioEvent에 있는 메소드. 친구요청을 하였음을 상대에게 알린다.
					sendFriendRequest(findIDResult);
				}
			},
			error: function(xhr, status, error) {
				alert(error);
			}   
		});
	});
	//친구요청 수락 버튼 이벤트 (동적으로 생성된 버튼의 이벤트라서 이렇게 처리한다.
	$(document).on('click', '.acceptBtn', function(){
		var fromId = $(this).attr('target');
		var toId = getCookie('id');
		alert(fromId);
		$.ajax({
			type:"POST",
			url:"./ajax/acceptRequest",
			data : {fromId : fromId,
					toId : toId},
			success: function(data){
				if(data=='success'){
					alert(data);
					//ioEvent에 있는 메소드로 이벤트 전송. 친구요청을 수락하였음을 상대에게 알림
					sendAcceptFriend(fromId, toId);
				}
			},
			error: function(xhr, status, error) {
				alert(error);
			}   
		});
		$(this).parent().parent().remove(); //해당 요청 라인 제거
	});
	
	$(document).on('dblclick', '.openChatting', function(){
		var roomNum = $(this).attr('roomnum');
		if(roomNum==-1){
			$('#modalBtn').click(); //모달창 호출
		}else{
			$('#modalBtn').click(); //모달창 호출
		}
	});
	
});