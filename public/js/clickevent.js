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
	$('#friendList').click(function(e){
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
		alert(findIDResult);
		$.ajax({
			type:"POST",
			url:"./ajax/friendRequest",
			data : {findIDResult : findIDResult},
			success: function(data){
				if(data=='success'){
					alert(data);
					//ioEvent에 있는 메소드
					sendFriendRequest(findIDResult);
				}
			},
			error: function(xhr, status, error) {
				alert(error);
			}   
		});
	});
	//친구요청 수락 버튼 이벤트
	$(document).on('click', '.acceptBtn', function(){
		var target = $(this).attr('target');
		alert(target);
	});
	
	
});