

create table Member(
	id varchar(50) not null primary key,
    password varchar(50) not null,
    name varchar(50) not null,
    registDate date);
    
insert into member values('master', '1234', '이승준', sysdate());
commit

alter table member add column unreadrequest int(3)

alter table member add column unreadmessage int(3)

create table requestFriend(
	fromId varchar(50) not null,
    toId varchar(50) not null,
    requestDate datetime not null)memberrequestfriend