//탭 클릭 이벤트
$( document ).ready(function(){
  $('#myTab a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

//탭 클릭 이벤트
  $('#chatts').click(function(e){
//  $.ajax({
//  type:"POST",
//  url:"./book.jsp",
//  data : {name : "홍길동"},
//  dataType : "xml",
//  success: function(xml){
//  console.log(xml);
//  },
//  error: function(xhr, status, error) {
//  alert(error);
//  }   
//  });
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
        if(data.length == 0){
          alert('해당하는 유저가 존재하지 않습니다.');
        }else{
          $('#friendRequest').show();
          $('#findIDResult').text(data[0].id);
        }
//      $btn.button('reset');
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
    $.ajax({
      type:"POST",
      url:"./ajax/acceptRequest",
      data : {fromId : fromId,
        toId : toId},
        success: function(data){
          if(data=='success'){
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
            sendNewRoomNum(roomNum, target);	//ioEvent메소드. io로 서버에 새로운
            //방 생성 알림
          },
          error: function(xhr, status, error) {
            alert(error);
          }   
      });
    }else{  //이미 생성된 방이 있을 경우
      $('#myModalLabel').attr('roomnum', roomNum);	//모달창에 roomnum속성 주기
      joinRoom(roomNum, id);	//io로 서버에 roomNum socket에 들어가겠다고 요청
      $.ajax({
        type:"POST",
        url:"./ajax/readAllMessage",
        data : {roomNum : roomNum},
        dataType : "json",
        success: function(data){
          data.forEach(function(obj, index){
            var unreadCount = obj.unreadPeople.split('||').length;
            if(obj.unreadPeople===''){
              unreadCount = 0;
            }
            var chattingArea = $('#chattingArea');
            chattingArea.append('<div>'+obj.name+'<span class="label label-success">'+obj.sendDate+'</span>'+'</div>');
            chattingArea.append('<pre>'+obj.message+'<span class="label label-warning unreadCount">'+unreadCount+'</span></pre>');
          });
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
                  count = data.count;
                  discountUnread(roomNum, count);	//방에 입장해서 안읽은 메세지들에 대해서
                  //안읽음 표시를 discount 해줄 것 요청(ioevent 메서드)
                }
              },
              error: function(xhr, status, error) {
                alert(error);
              }   
          });

        },
        error: function(xhr, status, error) {
          alert(error);
        }   
      });
      if(tdObject.attr('isChattList')=='true'){  //채팅리스트에서 열린것인지 확인
        var index = $('.list-group-item').index(tdObject);
        var count = Number($('.chattingRoomUnreadCount').eq(index).text());
        if(count != 0) {
          $('.chattingRoomUnreadCount').eq(index).text('0'); //해당하는 채팅룸의 방에 안읽음 수가 0이 아닐 때 0으로...
          var totalCount = Number($('#chattingMessageCount').text());
          var result = totalCount - count;
          if(result<=0) result = '';
          $('#chattingMessageCount').text(result);   //탭에서의 총 안읽음 숫자를 줄여줌.
        }

      }
    }

    $('#myModalLabel').text(tdObject.text());	//모달창 제목에 상대편 이름 입력
    $('div#myModal').modal(); //모달창 호출


  });

  //채팅 send버튼 이벤트
  $('#chattingSendBtn').click(function(e){
    e.preventDefault();
    var roomNum = $('#myModalLabel').attr('roomnum');
    var id = getCookie('id');
    var name = decodeURIComponent(getCookie('name'));	//cookie에 있는 값 디코드
    var message = $('#chattTextInput').val();
    $('#chattTextInput').val('');
    $.ajax({
      type:"POST",
      url:"./ajax/sendMessage",
      data : {roomNum : roomNum,
        id : id,
        name : name,
        message : message},
        dataType : "json",
        success: function(data){
          if(data.result=='success'){
            var unreadPeople = data.unreadPeople;	//메세지 안 읽은 사람들 목록
            sendMessageToIO(id, roomNum, message, unreadPeople);//ioEvent메소드. 서버에 메세지 전송
          }
        },
        error: function(xhr, status, error) {
          alert(error);
        }   
    });

  });

  //모달 오픈 이벤트 리스너
  $('div#myModal').on('shown.bs.modal', function (e) {
    $('#chattingArea').scrollTop($('#chattingArea').prop('scrollHeight'));
    $('#chattTextInput').focus();
  });
  //모달 클로즈 이벤트 리스너
  $('div#myModal').on('hidden.bs.modal', function (e) {
    var roomNum = $('#myModalLabel').attr('roomnum');
    var id = getCookie('id');
    leaveRoom(roomNum, id);		//io로 서버에 roomNum socekt 방을 나가겠다고 요청
    $('#myModalLabel').removeAttr('roomnum');
    $('#chattingArea').html('');
  });

//모달 오픈 이벤트 리스너
  $('div#createRoomModal').on('shown.bs.modal', function (e) {
    var content =  $('#friendListTable').html();
    $('#createRoomContent').html(content);          //친구목록에 있는 목록들 배껴오기
    $('#createRoomContent td').attr('class', 'createRoom'); //클래스 변경
  });
  //모달 클로즈 이벤트 리스너
  $('div#createRoomModal').on('hidden.bs.modal', function (e) {
    $('#chattUsers').val('');
    $('#createRoomContent').html('');
  });
  
  $(document).on('dblclick', '.createRoom', function(){
    var id = $(this).attr('target');
    var chattUsers = $('#chattUsers').val();
    if(chattUsers == ''){
      $('#chattUsers').val(id);
    }else{
      chattUsers = chattUsers+'||'+id;
      $('#chattUsers').val(chattUsers);
    }
  });
  
  $('#createRoomBtn').on('click', function(e){
    var chattUsers = $('#chattUsers').val();
    var userArray = chattUsers.split('||');
    if(chattUsers==''){ //초대 목록에 사람이 없는경우
      alert('방에 초대할 사람이 없습니다.')
    }else if(userArray.length==1){  //한명인 경우
      alert('한명입니다');
      var tdObject = $('#friendListTable td[target='+chattUsers+']'); //한명인 경우 원래 있던 이벤트로(친구 클릭)
      tdObject.dblclick();
      $('div#createRoomModal').modal('hide');
    }else{    //여러명일 경우
      userArray.push(getCookie('id'));
      $.ajax({
        type:"POST",
        url:"./ajax/createMultiChatt",
        data : {userArray : userArray},
          dataType : "json",
          success: function(data){
            if(data.result=='success'){
              var roomNum = data.roomNum;
              $('#myModalLabel').attr('roomnum', roomNum); //모달창에 roomnum속성 주기
              $('#myModal').modal();
            }
          },
          error: function(xhr, status, error) {
            alert(error);
          }   
      });
    }
  });

});