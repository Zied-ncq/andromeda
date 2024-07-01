import { AndromedaLogger } from "./andromeda-logger.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { config as LoadDotEnvConfig } from "dotenv";
import {get} from 'env-var';

let config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
LoadDotEnvConfig({ path: path.join(__dirname, '../..', '.env') });
const Logger = new AndromedaLogger();

/**
 * Class representing the configuration settings.
 */
export class Config {
    /**
     * @type {string} The database URI.
     */
    dbURI;

    /**
     * @type {string} The deployment path.
     */
    deploymentPath;

    /**
     * @type {string} The deployment folder.
     */
    deploymentFolder;

    /**
     * @type {string} The temporary path.
     */
    tempPath;

    /**
     * @type {Array<string>} The list of activated modules.
     */
    activateModules = [];

    /**
     * @type {string} The environment.
     */
    env;

    /**
     * @type {string} The host.
     */
    host;

    /**
     * @type {string} The port.
     */
    port;

    /**
     * @type {boolean} Indicates if the environment is local mode.
     */
    isLocalMode;

    /**
     * @type {boolean} Indicates if the environment is unit test mode.
     */
    isTestMode;

    /**
     * Gets the singleton instance of the Config class.
     * @param {boolean} [force=false] - Force creating a new instance.
     * @returns {Config} The Config instance.
     */
    static getInstance(force = false) {
        if (!config || force) {
            Logger.info(`Creating new Config instance`);
            config = new Config();
        }
        return config;
    }

    /**
     * Creates an instance of Config and loads configuration values.
     * @constructor
     */
    constructor() {
        try {
            Logger.trace(`Loading Config values...`);
            this.dbURI = get('DB_URI').asString();
            this.deploymentFolder = get('DEPLOYMENT_FOLDER').default("containers").asString();
            this.deploymentPath = get('DEPLOYMENT_PATH').default(path.join(process.cwd(), this.deploymentFolder)).asString();
            this.tempPath = get("TEMP_PATH").default("temp").asString();
            this.activateModules = get("ACTIVE_MODULES").asString().split(',').map(e => e.trim());
            this.env = get("ENV").default("local").asString();
            this.isLocalMode = this.env === "local";
            this.isTestMode = get("PROFILE").asString() === "test";
            this.host = get("HTTP_HOST").default("127.0.0.1").asString();
            this.port = get("HTTP_PORT").default("5000").asString();
        }catch (e) {
            Logger.error(e)
        }

    }
}
