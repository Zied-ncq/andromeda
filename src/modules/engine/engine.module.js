import {AndromedaLogger} from "../../config/andromeda-logger.js";

import {Config} from "../../config/config.js";

const Logger = AndromedaLogger;


export class EngineModule {



    constructor() {
        this.name='ENGINE'
    }


    // start the server!
    start  ()  {
        return new Promise((async (resolve, reject) => {
            try {
                if (Config.getInstance().isLocalMode) {
                    const daemon = await import("./embedded/embedded.sidecar.daemon.service.js");
                    daemon.EmbeddedSidecarDaemonService.initDaemon();
                }
            } catch (err) {
                Logger.error(err)
                reject(err)
            }
        }));
    }

    dispose(){
        Logger.info(`Engine is stopping`)
    }

}

export  default  EngineModule;