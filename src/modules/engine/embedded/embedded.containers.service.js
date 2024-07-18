import {EmbeddedContainerModel} from "./embedded.container.model.js";
import utils, {Utils} from "../../../utils/utils.js";
import path from "path";
import fs from "fs";
import {Config} from "../../../config/config.js";

import {AndromedaLogger} from "../../../config/andromeda-logger.js";
import http from "http";
import {EmbeddedLauncher} from "./embedded-launcher.js";
const Logger = AndromedaLogger;

export class EmbeddedContainerService {

    static containers= [];
    static portOffset = 10000
    static maxAttemptsRange = 100;

    static allocatedPorts = [];
    static isPortFree = port =>
        new Promise(resolve => {
            const server = http
                .createServer()
                .listen(port, () => {
                    server.close()
                    Logger.trace(`port ${port} is free`);
                    resolve(true)
                })
                .on('error', () => {
                    Logger.trace(`port ${port} is not free`);
                    resolve(false)
                })
        });

    static async AllocatePortInRange(containerPort) {
        if(containerPort){
            if(this.allocatedPorts.includes(containerPort)){
                if(! await this.isPortFree(containerPort)){
                    throw new Error(`cannot allocate port ${containerPort}, already allocated`);
                }
            }
            this.allocatedPorts.push(containerPort);
            return containerPort;
        }

        let attempts = 0;


        let port = EmbeddedContainerService.portOffset;
        while (attempts < EmbeddedContainerService.maxAttemptsRange ){
            if(!this.allocatedPorts.includes(attempts+EmbeddedContainerService.portOffset)){
                port = EmbeddedContainerService.portOffset+ attempts;
                Logger.debug(`trying to allocate port ${port}`);
                Logger.debug(`pushing  port ${port} to port list `);
                this.allocatedPorts.push(port)
                if(await this.isPortFree(port)){
                    return parseInt(String(port));
                }
            }
            attempts++;
        }
        if(attempts === EmbeddedContainerService.maxAttemptsRange ){
            throw `cannot allocate port ${port} after ${(EmbeddedContainerService.maxAttemptsRange)} attempts`;
        }
    }

    /**
     *
     * @param wpid {string}
     * @param version {string}
     * @param options
     * @returns {Promise<*|number>}
     */
    static async startEmbeddedContainer(wpid, version, options) {
        let allocatedPort = await this.allocatePort(options);

        Logger.info(`starting container on port ${allocatedPort}`)

        const deploymentPath = path.join(Config.getInstance().deploymentPath, wpid, version)

        this.deleteEmbeddedContainerPidFile(wpid, version, allocatedPort);

        let childProcess;
        let executor = '';
        let args = []


        executor = path.join(deploymentPath, "/bootstrap.js")
        try {
            const embeddedLauncher = new EmbeddedLauncher();
            childProcess = await embeddedLauncher.start(executor, {
                max: 1,
                silent: false,
                killTree: true,
                env: {
                    HTTP_PORT: String(allocatedPort),
                    DB_URI: Config.getInstance().dbURI,
                    wpid: wpid
                },
                mode: 'spawn',
                cwd: deploymentPath,
                args: args
            });
            if (!childProcess || !childProcess.pid) {
                throw new Error(`cannot start child process`);
            }

        } catch (e) {
            Logger.error(e)
            throw e;
        }


        const pid = childProcess.pid
        Logger.trace(`storing PID= ${pid}, for process ${wpid}, on port ${allocatedPort}`)
        EmbeddedContainerService.containers.push({wpid, model: new EmbeddedContainerModel(pid, allocatedPort, wpid)});

        if (Config.getInstance().isLocalMode && !Config.getInstance().isTestMode) {
            const daemon = await import("../embedded/embedded.sidecar.daemon.service.js");

            daemon.EmbeddedSidecarDaemonService.watchContainer(pid)
        }

        await this.waitForEmbeddedContainerStart(deploymentPath, wpid, allocatedPort);
        return allocatedPort;
    }

    static deleteEmbeddedContainerPidFile(wpid, version, port) {
        const basePath = Utils.getDeploymentPathUsingWPidAndVersion(wpid, version)
        const pidPath= path.join(basePath , `.pid_${port}`)
        if (fs.existsSync(pidPath)) {
            Logger.debug(`deleteEmbeddedContainerPidFile:: Found pid file`)
            try {
                Logger.debug(`deleteEmbeddedContainerPidFile:: deleting pid file`)
                fs.unlinkSync(pidPath)
            } catch (err) {
                Logger.error(err)
            }
        }else{
            Logger.debug(`deleteEmbeddedContainerPidFile:: pid file NOT FOUND at ${pidPath}`)
        }
    }

    static async allocatePort(options) {
        if (options && options.HTTP_PORT) {
            return options.HTTP_PORT
        } else {
            return await EmbeddedContainerService.AllocatePortInRange();
        }
    }

    /**
     *
     * @param {string} deploymentPath
     * @param {string} wpid
     * @param {number} allocatedPort
     * @returns {Promise<void>}
     */
    static async waitForEmbeddedContainerStart(deploymentPath, wpid, allocatedPort) {
        const runContainer = async () => {
            if (fs.existsSync(deploymentPath + `/.pid_${allocatedPort}`)) {
                Logger.info(`Found process id (PID), for process ${wpid}, on port ${allocatedPort}`)
                return true;
            } else {
                Logger.trace(`waiting for the container ${wpid} to connect on port ${allocatedPort}`)
                await Utils.sleep(1000)
                return false;
            }
        };

        let numberOfAttempts = 300;
        Logger.info(`Waiting for the embedded container ${wpid} to connect on port ${allocatedPort}`)
        for (let i = 0; i < numberOfAttempts; ++i) {
            if (await runContainer()) {
                break;
            }
            if (i === numberOfAttempts - 1) {
                Logger.error(`Cannot start embedded container:${wpid} Max number of attempts reached, on port ${allocatedPort}`);
                await this.stopEmbeddedContainer(wpid, allocatedPort)
                throw `cannot start embedded container`;
            }
        }
    }

    static async stopEmbeddedContainer(wpid, version, port) {
        if(!port){
            Logger.error(`to stop embedded container port must not specified `)
            throw new Error(`to stop embedded container port must not specified `)
        }
        Logger.debug(`stopEmbeddedContainer :: ${wpid}`)
        const embeddedLauncher = new EmbeddedLauncher();
        EmbeddedContainerService.containers.forEach(e=>{
            if(e.model.wpid === wpid){
                Logger.debug(`stopEmbeddedContainer :: with pid ${e.model.pid}`)
                EmbeddedContainerService.deleteEmbeddedContainerPidFile(wpid, version, port);
                embeddedLauncher.killProcessTree(e.model.pid)
            }
        });
    }
}