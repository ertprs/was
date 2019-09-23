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

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, err => console.error(`${new Date()}: ${err}`));
	instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, err => console.error(`${new Date()}: ${err}`));

  return { 
    instance,
    STATEMENTS: MySQLEvents.STATEMENTS
  }

}