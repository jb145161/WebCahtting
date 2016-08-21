//탭 클릭 이벤트
$( document ).ready(function(){
	$('#myTab a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});
	

	$('#chatts').click(function(e){
//		$.ajax({
//			type:"POST",
//			url:"./book.jsp",
//			data : {name : "홍길동"},
//			dataType : "xml",
//			success: function(xml){
//				console.log(xml);
//			},
//			error: function(xhr, status, error) {
//				alert(error);
//			}   
//		});
	});
	$('#friendList').click(function(e){
	});
	$('#message').click(function(e){
	});
	$('#addFriend').click(function(e){
	});
	//소켓 연결
	var socket = io.connect();
});