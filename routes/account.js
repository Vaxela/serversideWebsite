var express = require('express');
var router = express.Router();

var functionExport = require("../modules/functionExport")

const db = functionExport.default.GetDatabaseImp()

router.get('/create-training', function (req, res) {
  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  } else {
      res.render("account-create-training.hbs")
  }
})

router.post('/create-training', function (req, res) {

  const accountId = req.session.accountId
  const errors = []

  if (!functionExport.default.UserLogged(req)) {
    res.redirect("/login")
  } else {

      const start = req.body.start
      const stop = req.body.stop
      const description = req.body.description

      db.createTrainingsForAccount(accountId, start, stop, description, function (errors, id) {
          if (0 < errors.length) {
              const model = {
                  errors: errors
              }
              res.render("account-create-training.hbs", model)
          } else {
              res.redirect("/accounts/" + accountId)
          }
      })
 
}
})

router.get('/create-weight', function (req, res) {
  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  } else {
      res.render("account-create-weight.hbs")
  }
})

router.post('/create-weight', function (req, res) {
  const accountId = req.session.accountId
  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  } else {
      const time = req.body.time
      const weight = req.body.weight

      db.createWeightForAccount(accountId, time, weight, function (errors, id) {
          if (0 < errors.length) {
              const model = {
                  errors: errors
              }
              res.render("account-create-weight.hbs", model)
          } else {
              res.redirect("/accounts/" + accountId)
          }
      })
  }
})




module.exports = router;
