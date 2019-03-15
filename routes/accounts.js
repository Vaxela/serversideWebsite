var express = require('express');
var router = express.Router();

var functionExport = require("../modules/functionExport")

const db = functionExport.default.GetDatabaseImp()

const jsonwebtoken = require('jsonwebtoken')

router.get('/', function(req, res){
  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  }
  else {db.getAllAccounts(function(error, accounts){
  const model = {
    accounts: accounts
  }
  
  res.render("accounts.hbs", model)
  
  })
}
})

router.get('/:id', function(req, res){
  const id = req.params.id
  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  }
  db.getAccountById(id, function (errors, result) {
          const model = {
              errors: errors,
              account: result
          }

          db.getTrainingsByAccountId(id, function(errors, trainings){
     
            
                model.errors += errors,
                model.isUserTraining = functionExport.default.IsUserId(req, id),
                model.trainings = trainings
           
                db.getWeightByAccountId(id, function(errors, weights){
                  
                  model.errors += errors,
                  model.isUserWeight = functionExport.default.IsUserId(req, id),
                  model.weights =weights
                 
                  res.render("account-detailed-view.hbs", model)
       
            
              })

        })

  })

  

})


router.get('/trainings/:id', function (req, res) {
  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  }
  const id = req.params.id

  db.getTrainingsByAccountId(id, function(errors, trainings){
     
      const model = {
          errors: errors,
          isUserTraining: functionExport.default.IsUserId(req, id),
          trainings: trainings
      }
      res.render("account-trainings.hbs", model)
})
})
router.get('/weights/:id', function (req, res) {

  if (!functionExport.default.UserLogged(req)) {
      res.redirect("/login")
  }
  const id = req.params.id

  db.getWeightByAccountId(id, function(errors, weights){
      const model = {
          errors: errors,
          isUserWeight: functionExport.default.IsUserId(req, id),
          weights: weights
      }
  res.render("account-weights.hbs", model)

  })

})





module.exports = router;
