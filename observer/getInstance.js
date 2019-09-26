const MySQLEvents = require('@rodrigogs/mysql-events');

const getconn = require('../db/_mysqlconn')

const { getPool, getConnection } = getconn()

module.exports = async () => {
	const pool = getPool

	const connection = await getConnection(pool)

	const instance = new MySQLEvents(connection, {
		startAtEnd: true,
		excludedSchemas: {
			mysql: true,
		},
  });
  
	await instance.start()

  return { 
		instance,
		MySQLEvents
  }

}