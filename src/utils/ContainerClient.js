import {AndromedaLogger} from "../config/andromeda-logger.js";
import Utils from "./utils.js";

const Logger = AndromedaLogger;

export class ContainerClient {

    port

    Logger = AndromedaLogger;

    constructor(port) {
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
    async startProcess(nwpid, version, port, variables) {
        const form = new FormData();
        if (variables) {
            form.append('variables', JSON.stringify(variables));
        }

        const startReq = await fetch(
            `http://127.0.0.1:${this.port}/start/process/${nwpid}/version/${version}`,
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


    static async waitForProcessInstanceToCompleteProcessing(processInstanceId, port) {
        const fetchProcessInstanceStatus = async () => {

            const startReq = await fetch(
                `http://127.0.0.1:${port}/process-instance/${processInstanceId}/status`,
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
                await Utils.sleep(500)
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