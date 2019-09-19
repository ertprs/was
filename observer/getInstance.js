const MySQLEvents = require('@rodrigogs/mysql-events');

const getconn = require('../db/_mysqlconn')

const { getConnection } = getconn()

module.exports = async () => {
	const connection = await getConnection()

	const instance = new MySQLEvents(connection, {
		startAtEnd: true,
		excludedSchemas: {
			mysql: true,
		},
  });
  
	await instance.start()

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
	instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);

  return { 
    instance,
    STATEMENTS: MySQLEvents.STATEMENTS
  }

}