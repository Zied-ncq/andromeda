import AndromedaLogger from "../../../../config/andromeda-logger.js";

const Logger = AndromedaLogger;



export class Stream {

    // id used to route messages to this stream of events
    streamId
    projections = {}
    streamPosition = 0;
    eventsRegistry = {}
    validators = {}


    constructor(streamId) {
        this.streamId = streamId;
    }

    get streamPosition() {
        return this.streamPosition
    }
    set streamPosition(value) {
        this.streamPosition = value
    }


    async dispatch(event) {

        if (event.type in this.projections){
            await this.projections[event.type].process(event)
        }

    }
}