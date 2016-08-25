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



/* GET home page. */
router.get('/', function(req, res, next) {
  
  if(req.cookies.id != undefined){
	  res.render('index');
  }else{
	  res.render('login', { title: 'Express' });
  }
  
});

router.post('/login', function(req, res, next) {
  var body = req.body;
  client.query('select password,name from member where id=?',[body.id]
  , function(error, result){
	  if(error){
		  console.log(error);
	  }else{
		  if(result.length==0){
			  res.render('login', {result:'no member'});
		  }else{
			  console.log(body);
			  console.log(body.password);
			  console.log(result[0].password);
			  if(body.password==result[0].password){
				  res.cookie('id', body.id);
				  res.cookie('name', encodeURIComponent(result[0].name));//한글 인코딩 후 cookie
				  res.render('index');
			  }else{
				  res.render('login', {result:'wrong password'});
			  }
				  
		  }
		  res.render('login', {result:'success'});
	  }
	  
  });
});

router.get('/registerMember', function(req, res, next) {
	  res.render('register');
	});

router.post('/registerMember', function(req, res, next) {
	var body = req.body;
	  client.query('select id from member where id=?',[req.body.name]
			  , function(error, result){
		  if(error){
			  console.log(error);
		  }else{
			  if(result.length==0){
				  client.query('insert into member values(?, ?, ?, sysdate())',
						 [body.id, body.password, body.name], 
						 function(){
					  res.render('login', {result:'success'});
				  });
			  }else{
				  res.redirect('/registerMember');
			  }
		  }
	  });
	});

module.exports = router;
