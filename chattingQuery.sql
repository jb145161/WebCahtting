

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
	fromId varchar(50) not null,
    toId varchar(50) not null,
    requestDate datetime not null)memberrequestfriend
    
    alter table requestFriend modify requestDate datetime
    
create table friends(
id varchar(50) not null,
myFriendsId varchar(50) not null,
roomnum int(5) not null,
myFriendName varchar(100) not null)

alter table friends add column myFriendName varchar(100) not null

SET SQL_SAFE_UPDATES=0;

delete from friends

alter table friends add column roomnum int(6) not null default -1