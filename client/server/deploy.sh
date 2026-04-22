#!/bin/bash

#read env
export $(grep -v '^#' .env | xargs)
#update
sudo apt update

#check if npm exists
if npm --version >/dev/null 2>&1; then
	echo -e "npm installed, continue \n"
else
	echo -e "installing npm\n"
	sudo apt install npm
fi


#check if mysql exists

if mysql --version >/dev/null 2>&1; then
	echo -e "mysql installed, continue \n"
else
	echo -e "installing mysql\n"
	sudo apt install mysql-server
fi


#check if tmux exists
if tmux --version >/dev/null 2>&1; then
	echo -e "tmux installed, continue \n"
else 
	echo -e "installing tmux\n"
	sudo apt install tmux
fi


#init database
echo -e "creating database\n"
sudo mysql -e "CREATE DATABASE malawi;"
sudo mysql -e "CREATE USER 'admin2'@'localhost' identified by '$DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON malawi.* to 'admin'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

#load database
mysql -u admin2 -p $DB_PASSWORD malawi < cs341s26mwed.sql 

#start server process
tmux new -d -s uplendo 'node server.js'

#finish
echo -e "complete\n"
exit 0
