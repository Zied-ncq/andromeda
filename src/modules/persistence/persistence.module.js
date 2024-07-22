 import mongoose from "mongoose";
import {Config} from "../../config/config.js";
import {AndromedaLogger} from "../../config/andromeda-logger.js";
 import {ProcessInstanceProjection} from "./event-store/projections/process-instance-projection.js";
 import {Stream} from "./event-store/streams/stream.js";
 import {ProcessInstanceStreamBuilder} from "./event-store/streams/process-instance/process-instance.stream-builder.js";

const Logger = AndromedaLogger;

export class PersistenceModule  {

    constructor() {
        this.name='persistence'
    }


    async start() {
        return new Promise( (async (resolve, reject) => {
            try {
                Logger.info(`Mongoose trying to connect...`)
                await mongoose.connect(Config.getInstance().dbURI, {
                    // useNewUrlParser: true,
                    // useUnifiedTopology: true,
                    // useFindAndModify: false,
                    // useCreateIndex: true,
                    // reconnectTries: 30,
                    // keepAlive: true,
                    //poolSize: 30,

                });
                mongoose.set('strictQuery', false);
                Logger.info(`Mongoose connected`)
                this.registerStreams();
                resolve();
            }catch (e) {
                Logger.error(e)
                reject(e)
            }
        }));
    }

    registerStreams(){
        const stream = new ProcessInstanceStreamBuilder().build()
        this.registerProjections(stream, stream.eventsRegistry.CREATE_PROCESS_INSTANCE, new ProcessInstanceProjection());
        this.registerProjections(stream, stream.eventsRegistry.CREATE_PROCESS_VARIABLES, new ProcessInstanceProjection());
        this.registerProjections(stream, stream.eventsRegistry.CLOSE_PROCESS_INSTANCE, new ProcessInstanceProjection());
        this.registerProjections(stream, stream.eventsRegistry.BULK_CREATE_SEQUENCE_FLOWS, new ProcessInstanceProjection());
    }

    /**
     *
     * @param {Stream} stream
     * @param {string} eventType
     * @param projector
     */
    registerProjections(stream, eventType, projector){
        stream.projections[eventType] =projector;
    }

    async dispose(){
        await mongoose.disconnect()
    }

}
