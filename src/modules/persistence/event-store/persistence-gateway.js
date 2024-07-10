import {EventStore} from "./event-store.js";



export class PersistenceGateway {

    /**
     *
     * @param containerId {uuid}
     * @param wpid {string}
     * @param processDef  {string}
     * @param version  {string}
     * @param processInstanceId {uuid}
     */
    static async newProcessInstance(containerId, wpid, processDef, version, processInstanceId) {
        await EventStore.apply({
            id: crypto.randomUUID(),
            streamId: "PROCESS_INSTANCE",
            type: "CREATE_PROCESS_INSTANCE",
            streamPosition: 0,
            data: {
                id: processInstanceId,
                wpid,
                processDef,
                status: 0,
                version,
                containerId
            },
            timestamp: new Date().toString()
        })
    }
    static closeProcessInstance(){

    };
}