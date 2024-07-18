import {AndromedaLogger} from "../config/andromeda-logger.js";

const Logger = AndromedaLogger;

export class ContainerClient {

    port

    Logger = AndromedaLogger;

    constructor(port) {
        this.port = port;
    }

    /**
     *
     * @param processDef {string}
     * @param version {string}
     * @param port {number}
     * @param variables {object}
     * @returns {Promise<void>}
     */
    async startProcess(processDef, version, port, variables) {
        const form = new FormData();
        if (variables) {
            form.append('variables', JSON.stringify(variables));
        }

        const startReq = await fetch(
            `http://127.0.0.1:${this.port}/start/process/${processDef}/version/${version}`,
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
}