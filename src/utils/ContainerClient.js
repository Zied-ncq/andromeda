import {AndromedaLogger} from "../config/andromeda-logger.js";
import Utils from "./utils.js";

const Logger = AndromedaLogger;

export class ContainerClient {

    port

    host

    Logger = AndromedaLogger;

    constructor(host, port) {
        if(host === undefined) throw new Error(`host must be defined`)
        if(port === undefined) throw new Error(`port must be defined`)
        this.host = host;
        this.port = port;
    }

    /**
     *
     * @param nwpid {string}
     * @param version {string}
     * @param port {number}
     * @param variables {object}
     * @returns {Promise<void>}
     */
    async startProcess(nwpid, version, variables) {
        const form = new FormData();
        if (variables) {
            form.append('variables', JSON.stringify(variables));
        }

        const startReq = await fetch(
            `http://${this.host}:${this.port}/start/process/${nwpid}/version/${version}`,
            {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                },
                body: form,
            },
        )
        if(!startReq.ok){
            throw new Error(await startReq.text())
        }
        return await startReq.json()
    }


    /**
     *
     * @param processInstance {string}
     * @param eventId {string}
     * @param variables {object}
     * @returns {Promise<void>}
     */
    async callCatchEvent(processInstance, eventId, variables) {
        const form = new FormData();
        if (variables) {
            form.append('variables', JSON.stringify(variables));
        }

        const startReq = await fetch(
            `http://${this.host}:${this.port}/process/${processInstance}/catch-event/${eventId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                },
                body: form,
            },
        )
        if(!startReq.ok){
            throw new Error(await startReq.text())
        }
    }


    async waitForProcessInstanceToCompleteProcessing(processInstanceId) {
        const fetchProcessInstanceStatus = async () => {

            const startReq = await fetch(
                `http://${this.host}:${this.port}/process-instance/${processInstanceId}/status`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*',
                    }
                },
            )
            let wait = false;
            if(startReq.ok){
                const res = await startReq.json()
                if(res.status === 'running' || res.status === 'initializing'){
                    Logger.info(`Process instance ${processInstanceId} is Still running`)
                    wait = true;
                }
            }else{
                Logger.error(`waitForProcessInstanceToCompleteProcessingId, this code is only for testing purpose:\n${JSON.stringify(await startReq.text())}`)
            }


            if (!wait) {
                Logger.info(` process instance ${processInstanceId} has completed`)
                return true;
            } else {
                Logger.trace(`Waiting for Process instance ${processInstanceId} to complete processing`)
                await Utils.sleep(300)
                return false;
            }
        };

        let numberOfAttempts = 30;
        for (let i = 0; i < numberOfAttempts; ++i) {
            Logger.info(`Waiting for Process instance ${processInstanceId} to complete processing attempt ${i}/${numberOfAttempts}`);
            if (await fetchProcessInstanceStatus()) {
                break;
            }
            if (i === numberOfAttempts - 1) {
                Logger.error(`Process instance ${processInstanceId} is Still running after ${numberOfAttempts} attempt, exiting now`);
                break;
            }
        }
    }

}