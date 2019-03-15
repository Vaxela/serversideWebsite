var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var functionExport = require("../modules/functionExport")
const secretToken = new Buffer("9LTMEQJYW", "base64").toString()
const jsonwebtoken = require('jsonwebtoken')

const db = functionExport.default.GetDatabaseImp()
//const db = app.SelectDn()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render("home.hbs");
});

router.get('/about', function (req, res) {
  res.render("about.hbs")
})

router.get('/contact', function (req, res) {
  res.render("contact.hbs")
})

router.get('/disconnect', function (req, res) {
  req.session.destroy()
  res.redirect("/")
})

router.get('/login', function (req, res) {
  const model = {
    username: "",
    errors: []
  }
  res.render("login.hbs", model)
})

router.post('/login', function (req, res) {
  const username = req.body.username
  const password = req.body.password

  db.getAccountByUsername(username, function (errors, account) {
    if (0 < errors.length) {
      const model = {
        username: username,
        errors: errors
      }
      res.render("login.hbs", model)

    } else if (!account) {
      const model = {
        username: username,
        errors: ["Username doesn't exist"]
      }
      res.render("login.hbs", model)
    } else if (!bcrypt.compareSync(password, account.password)) {
      const model = {
        username: username,
        errors: ["Wrong password"]
      }
      res.render("login.hbs", model)
    } else {
      console.log("Login succeeded.")
      // Login succeeded.
      req.session.accountId = account.id
      res.redirect("/accounts")
    }

  })
})



router.get('/register', function (req, res) {

  const model = {
    username: "",
    errors: []
  }

  res.render("register.hbs", model)
})

router.post('/register', function (req, res) {
  const username = req.body.username
  const password = req.body.password
  const birthdate = req.body.birthdate
  const city = req.body.city

  const errors = []

  if (username.length < 3) {
    errors.push("Username too short.")
  } else if (15 < username.length) {
    errors.push("Username too long.")
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters.")
  } else if (city.length == 0) {
    errors.push("Set a City please.")
  } else if (birthdate.length == 0) {
    errors.push("Set a Birth Date please.")
  }

  if (0 < errors.length) {
    const model = {
      username: username,
      errors: errors
    }
    res.render("register.hbs", model)
  } else {
    bcrypt.hash(password, salt, (err, hash) => {
      if (!err) {
        db.createAccount(username, hash, birthdate, city, function (errors, result) {
          if (errors && 0 < errors.length) {
            const model = {
              username: username,
              errors: errors
            }
            res.render("register.hbs", model)
          } else {
            req.session.accountId = result.id
            res.redirect("/accounts")
          }
        })
      } else {
        console.log(err)
      }
    });


  }
})

//API function
function isUserLogged(userId, authorizationToken) {
  //Verify the token from the User
  var payload = null
  try {
    payload = jsonwebtoken.verify(authorizationToken, secretToken)
  } catch (e) {
    console.log(e)
    return false
  }
  if (userId != payload.accountId) {
    console.log("The user " + userId + "doesn\'t have the same ID" + payload.accountId)
    return false
  }
  return true
}

function handleWeightsError(userId, weight, time) {
  if (!userId || weight.length < 0 || time.length < 0)
    return true
  return false
}

function handleTrainingsError(userId, start, stop, description) {
  if (!userId || start.length < 0 || stop.length < 0 || description == "")
    return true
  return false
}

//Api Route
router.post("/tokens", function (req, res) {
  const username = req.body.username
  const password = req.body.password
  db.getAccountByUsername(username, function (errors, account) {
    if (0 < errors.length) {
      res.status(500).end()
    } else if (!account) {
      res.status(400).json({
        error: "invalid_client"
      })
    } else if (!bcrypt.compareSync(password, account.password)) {
      res.status(400).json({
        error: "invalid_password"
      })
    } else {
      // Login succeeded.
      const access_token = jsonwebtoken.sign({
        accountId: account.id
      }, secretToken)

      const id_token = jsonwebtoken.sign({
        sub: account.id,
        preferred_username: account.username
      }, secretToken)

      res.status(200).json({
        access_token: access_token,
        token_type: "Bearer",
        id_token: id_token
      })
    }
  })
})



/*
POST /api/weights HTTP/1.1
Host: mytd.com
Authorization: Bearer THE.ACCESS.TOKEN
Content-Type: application/json
Content-Length: 52
{"userId": 123, "weight": 73000, "time": 1545660000}
*/
router.post("/weights", function (req, res) {
  const userId = req.body.userId
  const weight = req.body.weight
  const time = req.body.time

  if (!req.headers.authorization) {
    res.status(401).end()
    return
  }


  if (!handleWeightsError()) {
    res.status(400).end()
    return
  }

  if (!isUserLogged(userId, req.headers.authorization)) {
    res.status(401).end()
    return
  }

  db.createWeightForAccount(userId, time, weight, function (errors, id) {
    if (0 < errors.length) {
      res.status(500).end()
    } else {
      res.status(204).end()
    }
  })
})


/*
POST /api/training-activities HTTP/1.1
Host: mytd.com
Authorization: Bearer THE.ACCESS.TOKEN
Content-Type: application/json
Content-Length: 111
{"userId": 123, "start": 1545660000, "stop": 1545663600,
"description": "Watched Donald while doing push-ups."}
*/
router.post("/training-activities", function (req, res) {

  const userId = req.body.userId
  const start = req.body.start
  const stop = req.body.stop
  const description = req.body.description

  if (!req.headers.authorization) {
    res.status(401).end()
    return
  }

  if (!handleTrainingsError()) {
    res.status(400).end()
    return
  }

  if (!isUserLogged(userId, req.headers.authorization)) {
    res.status(401).end()
    return
  }

  db.createTrainingsForAccount(userId, start, stop, description, function (errors, id) {
    if (0 < errors.length) {
      res.status(500).end()
    } else {
      res.status(204).end()
    }
  })
})


module.exports = router;