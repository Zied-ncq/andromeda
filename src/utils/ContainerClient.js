import {AndromedaLogger} from "../config/andromeda-logger.js";

const Logger = new AndromedaLogger();

export class ContainerClient {

    port

    Logger = new AndromedaLogger();

    constructor(port) {
        this.port = port;
    }

    /**
     *
     * @param processDef {string}
     * @param port {number}
     * @param variables {object}
     * @returns {Promise<void>}
     */
    async startProcess(processDef, port, variables) {
        const form = new FormData();
        if (variables) {
            form.append('variables', JSON.stringify(variables));
        }
        // const config = {headers: form.getHeaders()};
        // when
        // return await fetch().post(`, form, config);
        const startReq = await fetch(
            `http://127.0.0.1:${this.port}/start`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: form,
            },
        )
        if(!startReq.ok){
            throw new Error(await startReq.text())
        }
    }
}