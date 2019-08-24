const mysql = require('mysql')
//require('dotenv').config()

const {
	MYSQL_HOST,
	MYSQL_USER,
	MYSQL_PWD,
	MYSQL_DB
} = process.env

const pool = mysql.createPool({
	connectionLimit: 10,
	host: MYSQL_HOST,
	user: MYSQL_USER,
	password: MYSQL_PWD,
	database: MYSQL_DB
})

const getConnection = async () => {
	return await new Promise ( resolve => {
		pool.getConnection( (err, connection) => {
			err ? console.log(`${new Date()} error: ${err.stack}`) : '' //console.log(`connected id: ${connection.threadId}`);
			resolve(connection)
		})
	})
}

const connect = async (query) => {
	return await new Promise( resolve => {
		pool.getConnection( (err, connection) => {
			err ? console.log(`${new Date()} error: ${err.stack}`) : '' //console.log(`connected id: ${connection.threadId}`);
			connection.query(query, (err, results, fields) => {
				err ? console.log(`${new Date()} error: ${err.stack}`) : null;
				connection.release()
				resolve(results)
			})

		})
	
	})

}

module.exports = () => ({
	pool,
	getConnection,
	connect
})