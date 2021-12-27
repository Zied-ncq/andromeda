
const utils = require("./utils");
const constants = require("./config/constants");



if (utils.moduleIsActive(constants.SERVER)) {
    let Engine = require('./modules/engine')
    module.exports.server = new Engine().start(5000)
}

if (utils.moduleIsActive(constants.PERSISTENCE)) {
    let Persistence = require('./modules/persistence')
    module.exports.persistnce = new Persistence();
}







