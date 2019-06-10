const getconn = require('./_mysqlconn')
const connection = getconn()
module.exports = async (tgl) =>{
  const query = `SELECT * FROM visits WHERE DATE(tanggal) = '${tgl}'`
  let res = await new Promise( resolve => {
    connection.getConnection( (err, connection) => {
			err ? console.log(`${new Date()} error: ${err.stack}`) : '' //console.log(`connected id: ${connection.threadId}`);
      connection.query(query, (err, results, fields) => {
  			err ? console.log(`${new Date()} error: ${err.stack}`) : null;
        resolve(results)
        //console.log(results)
        connection.release()
      })
    })
  })
  return res
}
