var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var client = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'1234',
	database: 'chatting',
	port: 3306
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//유저의 정보 요청 처리
router.post('/readUserInfo', function(req, res){
	var id = req.body.id;
	client.query('select id, name from member where id=?', [id], function(error, result){
		if(error){
			console.log(error);
		}else{
			res.send(result);
		}
	});
});

//친구찾기
router.post('/findFriend', function(req, res){
	var findID = req.body.id;
	console.log(findID);
//	findID = '%'+findID+'%';   //이것을 Like 문으로 사용하면 해당하는 문자열 포함된 모든 유저 반환하게
	
	client.query('select id from member where id = ?',[findID]
	, function(error, result){
		if(error){
			console.log(error);
		}else{
			res.send(result);
		}
	});

});
//친구요청
router.post('/friendRequest', function(req, res){
	var fromId=req.cookies.id;
	var toId = req.body.findIDResult;
	
	
	client.query('insert into requestFriend(fromId,toId,requestDate) values(?,?,now())',[fromId, toId],
			function(error){
		if(error) {
			console.log(error);
		}else{
			res.send('success');
		}
	});
});
//페이지 처음 접속 시 친구요청들을 읽어옴
router.post('/readRequests', function(req, res){
	var id = req.body.id;
	client.query('select * from requestFriend where toId=? order by requestDate desc', [id],
			function(error, result){
		if(error){
			console.log(error);
		}else{
			res.send(result);
		}
	});
});
//처음 접속 시 모든 친구들 읽어옴
router.post('/readFriends',function(req,res){
	var id = req.body.id;
	client.query('select myfriendsid, myfriendname, roomnum from friends where id=?',[id],
			function(error, result){
		if(error){
			console.log(error)
		}else{
			res.send(result);
		}
	})
	
});
//친구요청을 수락함
router.post('/acceptRequest', function(req, res){
	var fromId = req.body.fromId;
	var toId = req.body.toId;
	client.query('insert into friends values(?, ?, -1, (select name from member where id = ?))',
			[fromId, toId, toId],	function(error){
		if(error){
			console.log(error);
			return;
		}
	});
	client.query('insert into friends values(?, ?, -1, (select name from member where id = ?))',
			[toId, fromId, fromId], function(error){
		if(error){
			console.log(error);
		}
	});
	client.query('delete from requestFriend where fromId=? and toId=?', [fromId, toId],
			function(error){
		if(error){
			console.log(error);
		}
	});
	res.send('success');
});

module.exports = router;
