var express = require('express');
var router = express.Router();
//var mysql = require('mysql');

//var client = mysql.createConnection({
//host:'localhost',
//user:'root',
//password:'1234',
//database: 'chatting',
//port: 3306
//});

var client = require('../mysqlConfig');

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
//처음 접속 시 모든 채팅 룸 리스트 읽어옴
router.post('/readChattingRoomList',function(req, res){
	var id = req.body.id;
	client.beginTransaction(function(error){	
		if(error){
			console.log(error);
			throw error;
		}
		
		client.query('select c.roomnum, c.id, c.unreadMessageCount from chattingrooms c,'+
				' (select * from messages order by sendDate) m where c.id = ? and '+
				'c.roomnum = m.roomNum', [id],
				function(error, result){
			if(error){
				console.log(error);
				client.rollback(function(){
					console.error('rollback error');
					throw error;
				});
				throw error;
			}//if error
			console.log('select chattingrooms');
			result.forEach(function(obj, index){
				client.query('select e.name from member e, (select id from chattingrooms where '+
						'roomnum = ? and id != ?) a where e.id = a.id', [obj.roomnum, id],
						function(error, result2){
					if(error){
						console.log(error);
						client.rollback(function(){
							console.error('rollback error');
							throw error;
						});
						throw error;
					}//if error
					result[index].names = result2;
				});//for query
			});//forEach
			client.commit(function(error){
				if(error){
					console.log(error);
					client.rollback(function(){
						console.error('rollback error');
						throw error;
					});
					throw error;
				}//if error
				res.send(result);
			});//commit
		});//first query
	});//begin connection 
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
//새로운 방을 만드는 요청
router.post('/createNewRoom', function(req, res){
	var target = req.body.target;
	var id=req.body.id;
	client.beginTransaction(function(error){		//커넥션 시작
		if(error){
			console.log(error);
			throw error;
		}
		client.query('insert into roomnumseq value()', function(error){
			if(error){
				console.log(error);
				client.rollback(function(){
					console.error('rollback error');
					throw error;
				});
				throw error;
			}//if error
			console.log('create roomnum');
			client.query('insert into chattingrooms values((select LAST_INSERT_ID()), ?,0)',
					[target], function(error){
				if(error){
					console.log(error);
					client.rollback(function(){
						console.error('rollback error');
						throw error;
					});
					throw error;
				}//if error
				console.log('insert into target');
				client.query('insert into chattingrooms values((select LAST_INSERT_ID()), ?,0)',
						[id], function(error){
					if(error){
						console.log(error);
						client.rollback(function(){
							console.error('rollback error');
							throw error;
						});
						throw error;
					}//if error
					console.log('insert into id');
					client.query('update friends set roomnum=(select LAST_INSERT_ID())'+
							' where (id=? and myFriendsId=?) or (id=? and myFriendsId=?)',
							[id, target, target, id], function(error){
						if(error){
							console.log(error);
							client.rollback(function(){
								console.error('rollback error');
								throw error;
							});
							throw error;
						}//if error
						client.query('select LAST_INSERT_ID() as roomNum',	//생성한 방넘버 전달
								function(error, result){
							if(error){
								console.log(error);
								client.rollback(function(){
									console.error('rollback error');
									throw error;
								});
								throw error;
							}//if error
							client.commit(function(error){
								if(error){
									console.log(error);
									client.rollback(function(){
										console.error('rollback error');
										throw error;
									});
									throw error;
								}//if error
								res.send(result);
							});//commit
						});//fifth query
					});//fourth query
				});//third query
			});//second query
		});// first query
	});//transaction 끝
});
//메세지를 보내는 요청 처리
router.post('/sendMessage', function(req, res){
	console.log('ajax 로 sendMessge 요청을 받았습니다.');
	console.log('받은 데이터 = '+JSON.stringify(req.body));
	var roomNum = req.body.roomNum;
	var id = req.body.id;
	var name = req.body.name;
	var message = req.body.message;
	var unreadPeople='';
	client.beginTransaction(function(error){
		if(error){
			console.log(error);
			throw error;
		}
		client.query('select id from chattingrooms where roomnum=?', [roomNum], 
				function(error, result){
			if(error){
				console.log(error);
				client.rollback(function(){
					console.error('rollback error');
					throw error;
				});
				throw error;
			}//if error
			console.log('select chatting members : '+JSON.stringify(result));
			result.forEach(function(obj, index){
				unreadPeople += obj.id+'||';
			});
			unreadPeople = unreadPeople.slice(0, -2);	//마지막에 있는 ||문자열 제거
			console.log('make unreadPeople : '+unreadPeople);
			client.query('insert into messages values(?,?,?,?,sysdate(),?)',
					[roomNum,id,name,message,unreadPeople], function(error){
				if(error){
					console.log(error);
					client.rollback(function(){
						console.error('rollback error');
						throw error;
					});
					throw error;
				}//if error
				console.log('insert into messages');
				chattingMemberIdArray = unreadPeople.split('||');
				chattingMemberIdArray.forEach(function(chattingMemberId, index){
					client.query('update chattingrooms set unreadMessageCount='+
							'(unreadMessageCount+1) where roomnum=? and id=?',
							[roomNum, chattingMemberId], function(error){
						if(error){
							console.log(error);
							client.rollback(function(){
								console.error('rollback error');
								throw error;
							});
							throw error;
						}//if error
						console.log(chattingMemberId+"에게 안읽은 메세지 수 추가");
					});
				});
				client.commit(function(error){
					if(error){
						console.log(error);
						client.rollback(function(){
							console.error('rollback error');
							throw error;
						});
						throw error;
					}//if error
					res.send({result : 'success', unreadPeople : unreadPeople});
				});//commit
			});//second query
		});//first query
	});//transaction 끝
});
//채팅창을 열었을 때 모든 대화 내용을 표시해줌
router.post('/readAllMessage', function(req, res){
	var roomNum = req.body.roomNum;
	client.query('select * from messages where roomNum=? order by sendDate', [roomNum], 
			function(error,result){
		if(error){
			console.log(error);
			throw error;
		}
		res.send(result);
	});
});
//메세지를 읽었다는 사실을 알려주는 요청
router.post('/readMessage', function(req, res){
	var roomNum = req.body.roomNum;
	var id = req.body.id;
	client.beginTransaction(function(error){
		if(error){
			console.log(error);
			throw error;
		}
		client.query('select unreadPeople from messages where roomNum=? order by sendDate desc',[roomNum],
				function(error,result){
			if(error){
				console.log(error);
				client.rollback(function(){
					console.error('rollback error');
					throw error;
				});
				throw error;
			}//if error
			if(result.length == 0) return;
			console.log('select unreadPeople :' +JSON.stringify(result));
			var count = 0;			//자신이 안읽은 메세지 숫자 담을 공간.
			if(result.length ==1){
				if(result[0].unreadPeople == id) {count = 1;}
			}else{
				result.forEach(function(obj, index){
					var tempText = obj.unreadPeople;
					var tempArray = tempText.split('||');
					for(var key in tempArray){
						if(id==tempArray[key]){
							count += 1;
							break;
						}
					}//for
				});//forEach
			}
			console.log('get count : '+count);

			var unreadPeople = result[0].unreadPeople;
			var unreadPeopleArray = unreadPeople.split('||');
			var newUnreadPeople='';	//수정할 정보 담을 문자변수
			for(var key in unreadPeopleArray){
				if(unreadPeopleArray[key]!=id){
					newUnreadPeople += unreadPeopleArray[key]+'||';
				}
			}//for
			newUnreadPeople = newUnreadPeople.slice(0,-2);  //마지막에 있는 ||문자열 제거
			console.log('make new UnreadPeople : '+newUnreadPeople);

			client.query('update messages set unreadPeople = ? where roomNum = ? and'+
					' (unreadPeople Like ? or unreadPeople Like ? or unreadPeople = ?)',
					[newUnreadPeople, roomNum, '%||'+id+'%', '%'+id+'||%', id], function(error){
				if(error){
					console.log(error);
					client.rollback(function(){
						console.error('rollback error');
						throw error;
					});
					throw error;
				}//if error
				console.log('update messages unreadPeople');
				client.query('update chattingrooms set unreadMessageCount = 0 where'+
						' roomnum = ? and id = ?', [roomNum, id], function(error){
					if(error){
						console.log(error);
						client.rollback(function(){
							console.error('rollback error');
							throw error;
						});
						throw error;
					}//if error
					console.log('update chattingrooms unreadCount set 0');
					client.commit(function(error){
						if(error){
							console.log(error);
							client.rollback(function(){
								console.error('rollback error');
								throw error;
							});
							throw error;
						}//if error
						console.log('commit');
						res.send({result : 'success', count : count});
					});//commit
				})//third query
			});//second query
		});//first query
	});//begin transaction 

});

router.post('/createMultiChatt', function(req, res){
	var body = req.body;
	var userArray = body['userArray[]'];
	console.log(JSON.stringify(body));
	client.beginTransaction(function(error){
		if(error){
			console.log(error);
			throw error;
		}//if
		client.query('insert into roomnumseq value()', function(error){
			if(error){
				console.log(error);
				client.rollback(function(){
					console.error('rollback error');
					throw error;
				});
				throw error;
			}//if error
			console.log(JSON.stringify(userArray));
			userArray.forEach(function(target, index){
				client.query('insert into chattingrooms values((select LAST_INSERT_ID()), ?,0)', [target], function(error){
					if(error){
						console.log(error);
						client.rollback(function(){
							console.error('rollback error');
							throw error;
						});
						throw error;
					}//if error
				});//for query
				console.log('insert to '+target);
			});//forEach
			client.query('select LAST_INSERT_ID() as roomNum',  //생성한 방넘버 전달
					function(error, result){
				if(error){
					console.log(error);
					client.rollback(function(){
						console.error('rollback error');
						throw error;
					});
					throw error;
				}//if error
				client.commit(function(error){
					if(error){
						console.log(error);
						client.rollback(function(){
							console.error('rollback error');
							throw error;
						});
						throw error;
					}//if error
					res.send(result);
				});//commit
			});//select query
		});//first query
	});//begin transaction
});


module.exports = router;
