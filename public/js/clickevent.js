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
		var tdObject = $(this);
		var roomNum = tdObject.attr('roomnum');	//아직 방이 안만들어졌을 경우 -1, 아니면 다른숫자
		var target = tdObject.attr('target');	//채팅을 하고자 하는 친구 아이디
		var id = getCookie('id'); //내 아이디
		if(roomNum==-1){	//방이 안만들어졌을 경우 방을 만드는 서비스 호출
//			$('div.modal').modal(); //모달창 호출
			$.ajax({
				type:"POST",
				url:"./ajax/createNewRoom",
				data : {target : target,
						id : id},
				dataType : "json",
				success: function(data){
					var roomNum = data[0].roomNum;	//생성한 방 넘버를 읽어옴
					tdObject.attr('roomnum', roomNum);  //친구목록에서 roomnum속성변경
					$('#myModalLabel').attr('roomnum', roomNum); //모달창에 roomnum속성 주기
					sendNewRoomNum(roomNum, target);
				},
				error: function(xhr, status, error) {
					alert(error);
				}   
			});
		}else{  //이미 생성된 방이 있을 경우
//			$('div.modal').modal(); //모달창 호출
		}
		$('#myModalLabel').text(tdObject.text());	//모달창 제목에 상대편 이름 입력
		$('div.modal').modal(); //모달창 호출
		
	});
	
	
	//모달 오픈 이벤트 리스너
	$('div.modal').on('show.bs.modal', function (e) {
		
		});
	//모달 클로즈 이벤트 리스너
	$('div.modal').on('hidden.bs.modal', function (e) {
		
		});
	
});