drop database IF exists demo2;
create database if not exists demo2;

use demo2;

drop table if exists user;

create table if NOT exists user(
    id int primary key auto_increment,
    username varchar(25) unique not null,
    password char(60) not null,
    first_name varchar(40) not null,
    last_name varchar(40) not null, 
    email varchar(100) unique not null,
    role enum('admin', 'SuperUser') default 'SuperUser',
    age int(11) default 0
);