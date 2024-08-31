import  {AndromedaLogger} from "../../../../config/andromeda-logger.js";
const Logger = AndromedaLogger;
import {VariableEncoder} from "../helpers/variable-encoder.js";
import { createHash } from 'crypto';


export class Variable {
    /**
     *  id {string}
     */
    id

    oldValue = null;

    currentValue = null;

    /**
     * name {string}
     */
    name = null;

    /**
     * type {string}
     */
    type;

    /**
     *
     * @param name {string}
     * @param type {string}
     */
    constructor(name, type) {
        this.name = name;
        if (type) {
            this.type = type
        }
    }

    /**
     *
     * @param input {string}
     * @returns {string}
     */
    generateMD5Hash(input) {
        return createHash('md5').update(input).digest('hex');
    }


    needToSave() {
        if(this.type !== "object"){
            return this.oldValue !== this.currentValue
        }else{
            return this.generateMD5Hash(JSON.stringify(this.currentValue)) !== this.generateMD5Hash(JSON.stringify( this.oldValue));
        }
    }

    resetStatus(){
        // this method is invoked after saving the variable
        if(this.type !== "object"){
            this.oldValue =  this.currentValue;
        }else{
            // deep clone & copy, dot not use reference
            this.oldValue =  JSON.parse(JSON.stringify(this.currentValue));
        }

    }

    value() {
       return this.currentValue;
    }

    /**
     *
     * @param value {unknown}
     */
    setValue(value) {
        let val = VariableEncoder.transcodeVariable(value, this.type, this.name);
        if(this.type !== "object"){
            Logger.debug(`Set variable ${this.name} to ${val}`)
        }else {
            Logger.debug(`set variable '${this.name}' to ${JSON.stringify(val)}`)
        }
        this.oldValue = this.currentValue;
        this.currentValue = val;
    }
}
