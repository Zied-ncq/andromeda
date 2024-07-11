import  {AndromedaLogger} from "./andromeda-logger.js";

let config;
import { get } from "env-var";

const Logger = AndromedaLogger;
export class Config {

    dbURI;
    tempPath;
    mode
    host
    port
    env

    static getInstance() {
        if (!config) {
            Logger.info(`creating new Config instance`)
            config = new Config();
        }
        return config;
    }

    constructor() {
        try {
            Logger.trace(`Loading Container ${process.env.APP} Config values...`)
            this.dbURI = get('DB_URI').required().asString();
            this.tempPath = get("TEMP_PATH").default("temp").asString();
            this.host = get("HTTP_HOST").default("127.0.0.1").asString();
            this.port = get("HTTP_PORT").default("5000").asString();
            this.mode = get("CONTAINER_MODE").default("local").asString();
            this.env = get("ENV").default("local").asString();
        }catch (e) {
            Logger.error(e)
        }

    }
}

export default Config;