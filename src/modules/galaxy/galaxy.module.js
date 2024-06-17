import {AndromedaLogger} from "../../config/andromeda-logger.js";
import path from "path";
import {fileURLToPath} from "url";

const Logger = new AndromedaLogger();


export class GalaxyModule {


    constructor(host, port) {
        this.name = 'Galaxy'
        // this.host=host
        // this.port=port
        // const __filename = fileURLToPath(import.meta.url);
        // const __dirname = path.dirname(__filename);




    }


    //
    start  ()  {

    }

    dispose(){
        Logger.info(`Galaxy is stopping`)
    }

}

export  default  GalaxyModule;