import {fileURLToPath} from "url";
import path from "path";
import fastify from "fastify";
import GracefulServer from "@gquittet/graceful-server";
import fastifySwagger from "@fastify/swagger";
import autoload from "@fastify/autoload";

import {AndromedaLogger} from "../../config/andromeda-logger.js";
import {Config} from "../../config/config.js";
import fs from "fs";
import {App} from "../../../app.js";
import fastifyMultipart from "@fastify/multipart";
const Logger = AndromedaLogger;


export class WebModule {

    app
    gracefulServer
    host
    port

    constructor(host, port) {
        this.name = "WEB"
        this.host=host
        this.port=port
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);


        this.app = fastify({ logger: null })
        this.gracefulServer = GracefulServer(this.app.server)

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
            Logger.info('Server is ready');
            fs.writeFileSync(path.join(process.cwd(),`./.pid_${Config.getInstance().port}`), process.pid.toString());
        })

        this.gracefulServer.on(GracefulServer.SHUTTING_DOWN, async () => {
            Logger.info('Server is shutting down')
            try {
                fs.unlinkSync(path.join(process.cwd(), `./.pid_${Config.getInstance().port}`));
                await App.close()

            } catch (e) {
                Logger.warn(`GracefulServer SHUTTING_DOWN cannot delete pid file`)
            }
        })

        this.gracefulServer.on(GracefulServer.SHUTDOWN, error => {
            Logger.info(`Server is down because of ${error.message}`)
        })

        this.app.register(fastifyMultipart, { attachFieldsToBody: 'keyValues' });

        this.app.register(autoload, {
            dir: path.join(__dirname, '../../routes'),
        });
    }

    start(){
        let startTime = new Date().getUTCMilliseconds();
        return new Promise((async (resolve, reject) => {
            try {
                await this.app.listen({port: this.port, host: this.host})
                this.app.swagger()
                let startCompleted = new Date().getUTCMilliseconds();
                Logger.info(`Engine started in ${startCompleted - startTime} ms, (${Config.getInstance().env} mode)`)
                this.gracefulServer.setReady()
                resolve(this.app);
            } catch (err) {
                Logger.error(err)
                reject(err)
            }
        }))
    }

    dispose(){
        Logger.info(`Web module is stopping`)
    }
}