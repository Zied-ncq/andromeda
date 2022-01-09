let AndromedaLogger = require("../../config/andromeda-logger");
let fastify = require('fastify');
const Logger = new AndromedaLogger();
let path = require('path');
let autoload = require('fastify-autoload');
const GracefulServer = require("@gquittet/graceful-server");
const multer = require("fastify-multer");
const fastifySwagger = require('fastify-swagger');


class Engine {

    app = fastify({ logger: Logger })

    gracefulServer = GracefulServer(this.app.server)

    constructor() {


        this.app.register(fastifySwagger, {
            mode: "static",
            routePrefix: '/api',
            hideUntagged: true,
            openapi: '3.0.3',
            specification: {
                path: './specification.yaml'
            },
            exposeRoute: true
        })


        this.gracefulServer.on(GracefulServer.READY, () => {
            Logger.info('Server is ready')
        })

        this.gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
            Logger.info('Server is shutting down')
        })

        this.gracefulServer.on(GracefulServer.SHUTDOWN, error => {
            Logger.info(`Server is down because of ${error.message}`)
        })

        // this.app.register(multer.contentParser, {addToBody: true})
        this.app.register(multer.contentParser)

        this.app.register(autoload, {
            dir: path.join(__dirname, '../../routes'),
        });

    }


    getApp() {
        return this.app;
    }

    // start the server!
    start = async (host, port) => {
        let startTime = new Date().getMilliseconds();
        try {
            await this.app.listen(port, host)
            this.app.swagger()
            let startCompleted = new Date().getMilliseconds();
            Logger.info(`Engine started in ${startCompleted - startTime} ms`)
            this.gracefulServer.setReady()
            return this.app;
        } catch (err) {
            Logger.error(err)
            process.exit(1)
        }
    }

}

module.exports = Engine