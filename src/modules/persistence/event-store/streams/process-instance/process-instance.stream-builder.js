import {Stream} from "../stream.js";
import {StreamIds} from "../stream-ids.js";
import {EventStore} from "../../event-store.js";

export const processInstanceDataSchema = {
    type: "object",
    properties: {
        id: {type: "string"},
        wpid: {type: "string"},
        version: {type: "string"},
        containerId: {type: "string"},
        status: {type: "integer"},
    },
    required: ["id", "wpid", "version", "containerId", "status"],
    additionalProperties: false,
}

export const createProcessVariablesDataSchema = {
    type: "object",
    properties: {
        wpid: {type: "string"},
        processInstanceId: {type: "string"},
        containerId: {type: "string"},
        variables: {type: "array"},
    },
    required: ["wpid", "containerId", "processInstanceId","variables"],
    additionalProperties: false,
}

export const closeProcessInstanceDataSchema = {
    type: "object",
    properties: {
        id: {type: "string"},
        containerId: {type: "string"},
    },
    required: ["id", "containerId"],
    additionalProperties: false,
}

export const failProcessInstanceDataSchema = {
    type: "object",
    properties: {
        id: {type: "string"},
        containerId: {type: "string"},
    },
    required: ["id", "containerId"],
    additionalProperties: false,
}

export const bulkCreateSequenceFlowsDataSchema = {
    type: "object",
    properties: {
        id: {type: "string"},
        sequenceFlows: {type: "array"},
    },
    required: ["id", "sequenceFlows"],
    additionalProperties: false,
}


export class ProcessInstanceStreamBuilder {

    /**
     *
     * @returns {Stream}
     */
    build(){
        const stream = new Stream(StreamIds.PROCESS_INSTANCE);
        stream.eventsRegistry =  {
            CREATE_PROCESS_INSTANCE : "CREATE_PROCESS_INSTANCE",
            CREATE_PROCESS_VARIABLES: "CREATE_PROCESS_VARIABLES",
            FAIL_PROCESS_INSTANCE   : "FAIL_PROCESS_INSTANCE",
            CLOSE_PROCESS_INSTANCE  : "CLOSE_PROCESS_INSTANCE",
            BULK_CREATE_SEQUENCE_FLOWS  : "BULK_CREATE_SEQUENCE_FLOWS"
        }
        stream.validators ={
            [stream.eventsRegistry.CREATE_PROCESS_INSTANCE] : processInstanceDataSchema,
            [stream.eventsRegistry.CREATE_PROCESS_VARIABLES] : createProcessVariablesDataSchema,
            [stream.eventsRegistry.CLOSE_PROCESS_INSTANCE] : closeProcessInstanceDataSchema,
            [stream.eventsRegistry.FAIL_PROCESS_INSTANCE] : failProcessInstanceDataSchema,
            [stream.eventsRegistry.BULK_CREATE_SEQUENCE_FLOWS] : bulkCreateSequenceFlowsDataSchema,
        }

        EventStore.registerStream(stream.streamId, stream);
        return stream;
    }

}