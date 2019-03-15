const Sequelize = require('sequelize')
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db-serverside-seq.db",
  define: {
    timestamps: false // I don't want timestamp fields by default
  },
})
const Accounts = sequelize.define("Accounts", {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Username already in use!'
    }
  },
  password: Sequelize.TEXT,
  birthDate: Sequelize.DATEONLY,
  city: Sequelize.TEXT
})

const Trainings = sequelize.define("Trainings", {
  start: Sequelize.INTEGER,
  stop: Sequelize.INTEGER,
  description: Sequelize.TEXT,
})

const Weights = sequelize.define("Weights", {
  time: Sequelize.INTEGER,
  weight: Sequelize.INTEGER,
})

Accounts.hasMany(Trainings)
Accounts.hasMany(Weights)

sequelize.sync()

exports.getAllAccounts = function (callback) {
  Accounts.findAll().then(function (accounts) {
    callback([], accounts)
  })
}

exports.getAccountByUsername = function (username, callback) {
  Accounts.findOne({
    where: {
      username: username
    }
  }).then(function (account) {
    if (account)
      callback([], account.dataValues)
    else
      callback([], undefined)
  }).catch(function (error) {
    console.log(error)
    callback(["Database error: " + error.message])
  });
}

exports.getAccountById = function (id, callback) {
  Accounts.findByPk(id).then(function (account) {
    if (account)
      callback([], account.dataValues)
    else
      callback([], undefined)
  }).catch(function (error) {
    callback(["Database error: " + error.message])
  });
}


exports.createAccount = function (username, password, birthdate, city, callback) {

  Accounts.create({
    username: username,
    password: password,
    birthDate: birthdate,
    city: city
  }).then(function (result) {
    if (result)
      callback([], result.dataValues)
    else
      callback([], undefined)
  }).catch(function (error) {
    console.log(error)
    if (error.message == "Username already in use!") {
      callback(["Username already in use!"])
    } else {
      callback(["Database error: " + error.message])
    }
  });
}

exports.createTrainingsForAccount = function (accountId, start, stop, description, callback) {
  Trainings.create({
    AccountId: accountId,
    start: start,
    stop: stop,
    description: description
  }).then(function (result) {
    callback([], result)
  }).catch(function (error) {
    console.log(error)
  });
}

exports.getTrainingsByAccountId = function (id, callback) {
  Accounts.findById(id, {
    include: Trainings
  }).then(function (account) {
    if (account)
      callback([], account.Trainings)
    else {
      callback(["Database Error"])
    }
  })
}

exports.createWeightForAccount = function (accountId, time, weight, callback) {
  Weights.create({
    AccountId: accountId,
    time: time,
    weight: weight,
  }).then(function (result) {
    callback([], result)
  }).catch(function (error) {
    console.log(error)
  });
}

exports.getWeightByAccountId = function (id, callback) {
  Accounts.findById(id, {
    include: Weights
  }).then(function (account) {
    if (account)
      callback([], account.Weights)
    else {
      callback(["Database Error"])
    }
  })
}