const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('./db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ liburnas: [] }).write()

module.exports = {
  getLiburnasByThn: tahun => db.get('liburnas').filter({ tahun }).value(),
  addLiburnas: obj => db.get('liburnas').push(obj).write()
}

// Add a post

// Set a user using Lodash shorthand syntax
//db.set('user.name', 'typicode')
//  .write()

// Increment count
//db.update('count', n => n + 1)
//  .write()