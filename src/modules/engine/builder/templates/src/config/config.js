import  {AndromedaLogger} from "./andromeda-logger.js";

let config;
import {config as LoadDotEnvConfig}  from 'dotenv';
import path from 'path'
import {fileURLToPath} from 'url';
import { get } from "env-var";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

LoadDotEnvConfig({path: path.join(__dirname, '../../..', '.env' )});
const Logger = new AndromedaLogger();
export class Config {
    dbUrl;
    tempPath;

    host
    port

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
            this.host = get("host").default("127.0.0.1").asString();
            this.port = get("port").default("5000").asString();
        }catch (e) {
            Logger.error(e)
        }

    }
}

export default Config;