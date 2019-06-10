const mysql = require('mysql')

const {
	MYSQL_HOST,
	MYSQL_USER,
	MYSQL_PWD,
	MYSQL_DB
} = process.env

const connection = mysql.createPool({
	connectionLimit: 10,
	host: MYSQL_HOST,
	user: MYSQL_USER,
	//password: MYSQL_PWD,
	database: MYSQL_DB
})

module.exports = () => connection