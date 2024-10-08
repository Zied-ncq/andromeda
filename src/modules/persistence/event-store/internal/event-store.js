import Ajv from "ajv";
import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {EventDataPayloadValidator} from "./event-data-payload.validator.js";
import {EventStoreRepository} from "../repositories/event-store.repository.js";
const Logger = AndromedaLogger;

export class EventStore {

    static streamsRegistry = {}

    static ajv = new Ajv()
    static eventSchema = {
        type: "object",
        properties: {
            id: {type: "string"},
            streamId: {type: "string"},
            type: {type: "string"},
            streamPosition: {type: "integer"},
            data: {type: "object"},
            metadata: {type: "object"},
            timestamp: {type: "string"},
        },
        required: ["id", "type", "streamId", "timestamp"],
        // streamPosition will be filled by the stream if not provided
        additionalProperties: false,
    }

    static async apply(event) {
        Logger.debug(event)
        const validate = EventStore.ajv.compile(EventStore.eventSchema)
        const valid = validate(event)
        if (!valid){
            Logger.error(`cannot validate event with type ${event.streamId}`, JSON.stringify(validate.errors))
            throw validate.errors
        }
        await EventStore.routeEventToCorrespondingStream(event);
        // save the event
        await new EventStoreRepository().persistEvent(event)

    }

    //
    static async routeEventToCorrespondingStream(event) {
        // choose the stream to route the event into
        if (!(event.streamId in EventStore.streamsRegistry)){
            throw new Error(`cannot find am aggregator for the streamId: ${event.streamId}`);
        }

        // validate the event before dispatch
        const stream = EventStore.streamsRegistry[event.streamId];
        // compute event stream position if not provided
        this.updateStreamPosition(event, stream);

        if (!(event.type in stream.eventsRegistry)) {
            throw new Error(`event type (${event.type}) not supported by the stream ${stream.streamId}`)
        }
        if(event.type in stream.validators){
            EventDataPayloadValidator.validate(event, stream.validators[event.type]);
        }

        await stream.dispatch(event);
    }

    static updateStreamPosition(event, stream) {
        if (!event.streamPosition) {
            event.streamPosition = stream.streamPosition;
        }
        stream.streamPosition++;
    }

    static registerStream(id, streamProcessor){
        EventStore.streamsRegistry[id] = streamProcessor
    }


    static getStream(streamName) {
          return EventStore.streamsRegistry[streamName];
    }
}