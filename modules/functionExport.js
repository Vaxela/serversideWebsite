
const dbSeqFunctions = require('../routes/Database/db-sequelize')
const dbSqlFunctions = require('../routes/Database/db-sqlite')


class ExtraFunction {

    constructor() {
        this.databaseImp = dbSeqFunctions;
        if (!!ExtraFunction.instance) {
            return ExtraFunction.instance;
        }

        ExtraFunction.instance = this;

        return this;
    }

    SetDatabaseImp (SetDb){
        if(SetDb == 0){
            console.log("Set to sequelize")
            this.databaseImp = dbSeqFunctions
        }else{
            console.log("Set to sqlite")
            this.databaseImp =  dbSqlFunctions
        }
    }

    GetDatabaseImp(){
        return this.databaseImp
    }

    UserLogged(req) {
        if (req.session.accountId) {
        console.log("User logged")

            return true
        }
        console.log("User not logged")
        return false
    }

    IsUserId(req, idToFind) {
        if (req.session.accountId == idToFind) {
            return true
        }
        return false
    }
}


  const instance = new ExtraFunction();
  exports.default = instance;

