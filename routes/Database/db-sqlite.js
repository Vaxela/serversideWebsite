const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("db-serverside-seq.db")

db.run(`
CREATE TABLE IF NOT EXISTS "Accounts" (
	id	INTEGER PRIMARY KEY AUTOINCREMENT,
	username	VARCHAR(255) NOT NULL UNIQUE,
	password	TEXT,
	birthDate	DATE,
	city	TEXT
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS "Trainings" (
	id	INTEGER PRIMARY KEY AUTOINCREMENT,
	start	INTEGER,
	stop	INTEGER,
	description	TEXT,
	AccountId	INTEGER,
	FOREIGN KEY("AccountId") REFERENCES "Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS "Weights" (
	id	INTEGER PRIMARY KEY AUTOINCREMENT,
	time	INTEGER,
	weight	INTEGER,
	AccountId 	INTEGER,
	FOREIGN KEY("AccountId") REFERENCES "Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
)
`)

exports.getAllAccounts = function(callback){
	const query = "SELECT * FROM Accounts"
	const values = []
	
	db.all(query, values, function (error, accounts) {
        if (error) {
            callback(["Database error"])
        } else {
            callback([], accounts)
        }
    })
}

exports.getAccountByUsername = function(username, callback){
	const query = "SELECT * FROM Accounts WHERE username = ?"
    const values = [username]

    db.get(query, values, function (error, account) {
        if (error) {
			console.log("Error: ")
			console.log(error)
            callback(["Database error : " + error.message])
        } else {
            callback([], account)
        }
    })
}

exports.getAccountById = function(id, callback){
	const query = "SELECT * FROM Accounts WHERE id = ?"
    const values = [id]

    db.get(query, values, function (error, account) {
        if (error) {
            callback(["Database error"])
        } else {
            callback([], account)
        }
    })
}


exports.createAccount = function(username, password, birthdate, city, callback){
	
	const query = `INSERT INTO Accounts (username, password, birthDate, city) VALUES (?, ?, ?, ?)`
    
    const values = [username, password, birthdate, city]

    db.run(query, values, function (error) {
        if (error) {
            if (error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Accounts.username") {
                callback(["Username already in use!"])
            } else {
                callback(["Database error: "+ error.message])
            }
        } else {
			let result = {id : this.lastID}
            callback([], result)
        }
    })
}

  exports.createTrainingsForAccount = function(accountId, start, stop, description, callback){
    const query = `INSERT INTO Trainings (accountId, start, stop, description) VALUES (?, ?, ?, ?)`
    const values = [accountId, start, stop, description]

    db.run(query, values, function (error) {
        if (error) {
            callback(["Database Error"])
        } else {
            callback([], this.lastID)
        }
    })
  }

  exports.getTrainingsByAccountId = function (id, callback){
    const query = "SELECT * FROM Trainings WHERE accountId = ?"
    const values = [id]

    db.all(query, values, function (error, trainings) {
        if (error) {
            callback(["Database error"])
        } else {
            callback([], trainings)
        }
    })
  }

  exports.createWeightForAccount = function(accountId, time, weight, callback){
    const query = `INSERT INTO Weights (accountId, time, weight) VALUES (?, ?, ?)`
    const values = [accountId, time, weight]

    db.run(query, values, function (error) {
        if (error) {
            callback(["Database Error"])
        } else {
            callback([], this.lastID)
        }
    })
  }

  exports.getWeightByAccountId = function (id, callback){
	const query = "SELECT * FROM Weights WHERE accountId = ?"
    const values = [id]

    db.all(query, values, function (error, weights) {
        if (error) {
            callback(["Database error"])
        } else {
            callback([], weights)
        }
    })
  }

