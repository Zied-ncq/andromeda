import {EventStore} from "./event-store.js";
import {StreamIds} from "./streams/stream-ids.js";
import {EventTypes} from "./event-types.js";



export class PersistenceGateway {

    /**
     *
     * @param containerId {uuid}
     * @param wpid {string}
     * @param version  {string}
     * @param processInstanceId {uuid}
     */
    static async newProcessInstance(containerId, wpid, version, processInstanceId) {
        await EventStore.apply({
            id: crypto.randomUUID(),
            streamId: StreamIds.PROCESS_INSTANCE,
            type: EventTypes.CREATE_PROCESS_INSTANCE,
            streamPosition: 0,
            data: {
                id: processInstanceId,
                wpid,
                status: 0,
                version,
                containerId
            },
            timestamp: new Date().toString()
        });
    }

    static async createProcessVariables(containerId, processInstanceId, variables, wpid) {
        await EventStore.apply({
            id: crypto.randomUUID(),
            streamId: StreamIds.PROCESS_INSTANCE,
            type: EventTypes.CREATE_PROCESS_VARIABLES,
            streamPosition: 0,
            data: {
                processInstanceId,
                containerId,
                wpid,
                variables
            },
            timestamp: new Date().toString()
        });
    }

    /**
     *
     * @param processInstancesId {string}
     * @param containerId  {string}
     * @returns {Promise<void>}
     */
    static async closeProcessInstance(processInstancesId, containerId ) {
        await EventStore.apply({
            id: crypto.randomUUID(),
            streamId: StreamIds.PROCESS_INSTANCE,
            type: EventTypes.CLOSE_PROCESS_INSTANCE,
            streamPosition: 0,
            data: {
                id: processInstancesId,
                containerId: containerId
            },
            timestamp: new Date().toString()
        })
    };

    static async failProcessInstance(processInstancesId, containerId ) {
        await EventStore.apply({
            id: crypto.randomUUID(),
            streamId: StreamIds.PROCESS_INSTANCE,
            type: EventTypes.FAIL_PROCESS_INSTANCE,
            streamPosition: 0,
            data: {
                id: processInstancesId,
                containerId: containerId
            },
            timestamp: new Date().toString()
        })

    };

    /**
     *
     * @param processInstancesId {string}
     * @param sequenceFlows {array}
     * @returns {Promise<void>}
     */
    static async bulkCreateSequenceFlows(processInstancesId, sequenceFlows) {
        await EventStore.apply({
            id: crypto.randomUUID(),
            streamId: StreamIds.PROCESS_INSTANCE,
            type: EventTypes.BULK_CREATE_SEQUENCE_FLOWS,
            streamPosition: 0,
            data: {
                id: processInstancesId,
                sequenceFlows,
            },
            timestamp: new Date().toString()
        });

    };


}