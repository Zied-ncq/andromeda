import {Stream} from "../stream.js";
import {StreamIds} from "../stream-ids.js";
import {EventStore} from "../../event-store.js";

export const processInstanceDataSchema = {
    type: "object",
    properties: {
        id: {type: "string"},
        wpid: {type: "string"},
        processDef: {type: "string"},
        version: {type: "string"},
        containerId: {type: "string"},
        status: {type: "integer"},
    },
    required: ["id", "wpid", "processDef", "version", "containerId", "status"],
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


export class ProcessInstanceStreamBuilder {

    /**
     *
     * @returns {Stream}
     */
    build(){
        const stream = new Stream(StreamIds.PROCESS_INSTANCE);
        stream.eventsRegistry =  {
            CREATE_PROCESS_INSTANCE: "CREATE_PROCESS_INSTANCE",
            CLOSE_PROCESS_INSTANCE: "CLOSE_PROCESS_INSTANCE"
        }
        stream.validators ={
            [stream.eventsRegistry.CREATE_PROCESS_INSTANCE] : processInstanceDataSchema,
            [stream.eventsRegistry.CLOSE_PROCESS_INSTANCE] : closeProcessInstanceDataSchema,
        }

        EventStore.registerStream(stream.streamId, stream);
        return stream;
    }

}