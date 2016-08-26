

create table Member(
	id varchar(50) not null primary key,
    password varchar(50) not null,
    name varchar(50) not null,
    registDate date);
    
insert into member values('master', '1234', '이승준', sysdate());
commit

alter table member add column unreadrequest int(3)

alter table member add column unreadmessage int(3)

alter table member add column unreadfriends int(3)

create table requestFriend(
	requestNum int(5) not null auto_increment primary key,
	fromId varchar(50) not null,
    toId varchar(50) not null,
    requestDate datetime not null)
    
    alter table requestFriend modify requestDate datetime
    
create table friendsfriends(
id varchar(50) not null,
myFriendsId varchar(50) not null,
roomnum int(5) not null  default -1,
myFriendName varchar(100) not null)

create table chattingrooms(
	roomnum int(5) not null,
    id varchar(50) not null,
    unreadMessageCount int(3) default 0
)
drop table chattingrooms
create table roomnumseq(
	roomnum int(5) not null auto_increment primary key
)
drop table roomnumseq
create table messages(
	roomNum int(5) not null,
    id varchar(50) not null,
    name varchar(50) not null,
    message text,
	sendDatemessages datetime not null,
    unreadPeople text
)

commit

alter table messages drop unreadPopleCount

alter table messages add column unreadPeople text
alter table friends add column myFriendName varchar(100) not null
- ALTER TABLE messages CHANGE unreadPople unreadPeople text

alter table chattingrooms add column unreadMessage int(3) default 0

SET SQL_SAFE_UPDATES=0;

delete from friends

drop table chattingrooms

select e.name from member e, (select id from chattingrooms where roomnum = 38 and id != 'master') a where e.id = a.id

delete from requestFriend

alter table friends add column roomnum int(6) not null