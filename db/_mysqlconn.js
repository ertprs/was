const mysql = require('mysql')
//require('dotenv').config()

const {
	MYSQL_HOST,
	MYSQL_USER,
	MYSQL_PWD,
	MYSQL_DB
} = process.env

const getPool = () => {
	return mysql.createPool({
		connectionLimit: 10,
		host: MYSQL_HOST,
		user: MYSQL_USER,
		password: MYSQL_PWD,
		database: MYSQL_DB
	})
}

const getConnection = async (pool) => {

	return await new Promise ( resolve => {
		pool.getConnection( async (err, connection) => {
			if(err) {
				console.log(`${new Date()} error: ${err.stack}`)
				connection = await getConnection(pool)
				resolve(connection)
			}
			connection.on('error', async (err) => {
				console.log('db error', err);
				if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
					connection = await getConnection(pool)
					resolve(connection)                         // lost due to either server restart, or a
				} 
			});
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
	getPool,
	getConnection,
	connect
})