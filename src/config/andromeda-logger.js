const log4js = require( "log4js");

const log4jsConfig = require( "./log4js.config");

log4js.addLayout('json', function (config) {
    return function (logEvent) {
        logEvent.application = 'engine';
        logEvent.processId = process.pid;
        if (process.env.IP) {
            logEvent.ip = process.env.IP;
        }
        if (process.env.ENV) {
            logEvent.ENV = process.env.ENV;
        }
        if (logEvent.data && logEvent.data.length > 0) {
            logEvent.message = logEvent.data[0];
            delete logEvent.data;
        }
        return JSON.stringify(logEvent);
    };
});
const log = log4js.getLogger('engine');

log4js.configure(log4jsConfig);

class AndromedaLogger {
    logger;
    loggerOptions;

    constructor(args) {
        this.logger = log;
    }

    get Logger() {
        return this.logger;
    }

    static configGlobal(options) {
        this.loggerOptions = options;
    }

    info(message) {
        this.logger.info(message);
    }

    error(message, trace) {
        this.logger.error(`${message} -> (${trace || 'trace not provided !'})`);
    }

    warn(message) {
        this.logger.warn(message);
    }

    debug(message, context) {
        this.logger.debug(message);
    }

    trace(message, context) {
        this.logger.trace(message);
    }

    fatal(message, context) {
        this.logger.fatal(message);
    }

    child() {
        return new AndromedaLogger()
    };


}
module.exports =AndromedaLogger