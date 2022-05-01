
import {AndromedaLogger} from "./src/config/andromeda-logger.js";
const Logger = new AndromedaLogger();
import {Utils} from "./src/utils/utils.js";
import constants from "./src/config/constants.js";
import {Config} from "./src/config/config.js";



export class App {

    host
    ip

    constructor(host, port) {
       this.host = host || Config.getInstance().host
       this.port  = port || Config.getInstance().port
    }

    modules = []

    loadedModules = 0;
    async executePromisesSequentially(modulePromisesArr) {
        for (let i=0; i < modulePromisesArr.length; i++) {
            await modulePromisesArr[i]();
            this.loadedModules = this.loadedModules +1;
        }
    }

    async init() {

        if (Utils.moduleIsActive(constants.PERSISTENCE)) {
            await this.initPersistenceModule();
        }

        // server should be initialised last, to load all changes made by other modules
        // - exp: specification yaml file
        if (Utils.moduleIsActive(constants.SERVER)) {
            await this.initServerModule();

        }

        await this.executePromisesSequentially(this.modules);
    }

    async initPersistenceModule() {
        try {
            let Persistence = await import('./src/modules/persistence/persistence.module.js')
            this.modules.push(Persistence.PersistenceModule.init)
        } catch (e) {
            Logger.error(e)
        }
    }

    async initServerModule() {
        try {
            let Engine = await import ('./src/modules/engine/engine.module.js')
            let engineModuleInstance = new Engine.EngineModule(this.host, this.port);
            this.modules.push(engineModuleInstance.start.bind(engineModuleInstance));
        } catch (e) {
            Logger.error(e)
        }
    }
}




export default App


