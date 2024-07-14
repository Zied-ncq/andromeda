import {Config} from "../config/config.js";

import {ContainerParsingContext} from "../model/parsing/container.parsing.context.js"
// import  {WorkflowParsingContext}  from "../model/parsing/workflow.parsing.context.js";
import BPMNModdle from "bpmn-moddle";
import {AndromedaLogger} from "../config/andromeda-logger.js";
import path from "path";
import {AProcess} from "../model/domain-model/bzprocess/a-process.js";
const Logger = AndromedaLogger;

export class Utils{
    static moduleIsActive(module) {
        return Config.getInstance().activateModules.filter(e => e === module).length > 0;

    }

    /**
     *
     * @param {ContainerParsingContext} ctx
     * @returns {string}
     */
    static getDeploymentPath(ctx) {
        return path.join(Config.getInstance().deploymentPath, ctx.wpid, ctx.version);
    }

    /**
     *
     * @param {string} wpid
     * @param {string} version
     * @returns {string}
     */
    static getDeploymentPathUsingWPidAndVersion(wpid, version) {
        return path.join(Config.getInstance().deploymentPath, wpid, version);
    }


    static sleep(ms) {

        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms, [])
        })
    }

    static normalizeProcessPrefixWithoutVersion(str) {
        const result = str;
        const regex = /(\w+)(-[vV][0-9]+\.[0-9]+)/;
        return result.replace(regex, `$1`);
    }

    static upperFirstChar(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }



    // static getwpid(model) {
    //     if(!model){
    //         return new Error(`model should not be null`);
    //     }
    //     return sanitize(model.rootElement.id);
    // }

    // normalizeProcessDefWithoutVersion(processDef) {
    //     const result = processDef;
    //     const regex = /(\w+)(-[vV][0-9]+\.[0-9]+)/;
    //     return result.replace(regex, `$1`);
    // }

    /**
     * Used to encapsulate exceptions in
     * @param call
     * @returns {Promise<*>}
     */
    static getError = async (call) => {
        try {
            await call();
        } catch (error) {
            return error;
        }
    };

}

export default Utils