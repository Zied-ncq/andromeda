import {BaseRepository} from "./baseRepository.js";

import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import VariableModel from "../internal/models/variable.orm-model.js";
import {VariableEncoder} from "../helpers/variable-encoder.js";
// const Logger = AndromedaLogger;

export class VariableRepository {

    /**
     * @type {BaseRepository}
     */
    repo;

    constructor() {
        this.repo= new BaseRepository(VariableModel)
    }

    isPrimitive(val) {
        return val !== Object(val);
    }


    async bulkUpsertVariables(
        variables,
        processInstanceId,
        wpid,
        callback,
    ) {
        const bulkOpBody = variables.map((variable) => {
            const record = {
                updateOne: {
                    filter: {
                        processInstanceId,
                        name: variable.name,
                    },
                    update: {},
                    upsert: true,
                },
            };

            if (!variable._id) {
                record.updateOne.update['$setOnInsert'] = { _id: crypto.randomUUID() };
            }

            record.updateOne.update['$set'] = {
                name: variable.name,
                type: variable.type,
                wpid,
                value: this.isPrimitive(variable.value())
                    ? variable.value()
                    : JSON.stringify(variable.value()),
                 processInstanceId,
            };

            return record;
        });
        const result = await VariableModel.bulkWrite(bulkOpBody, {
            ordered: true,
        });
        if (callback) {
            callback(result);
        }
        // if (result.upsertedIds) {
        //   Object.keys(result.upsertedIds).forEach((index) => {
        //     variables[index]._id = result.upsertedIds[index];
        //   });
        // }

        // variables.forEach((variable) => {
        //   Logger.verbose(`variable ${variable.name} was updated`);
        //   variable.resetStatus();
        // });
    }

    /**
     *
     * @param processInstanceId {string}
     * @returns {Variable[]}
     */
    async getProcessInstanceVariables(processInstanceId){
        const variables=  await this.repo.find({processInstanceId: processInstanceId}) || []
        return variables.map(e=> ({
            id: e._id,
            name: e.name,
            type : e.type,
            wpid: e.wpid,
            value: e.value,
            processInstanceId: processInstanceId,
        }))
    }

    /**
     *
     * @param processInstanceId {string}
     * @param name {string}
     * @returns {Variable}
     */
    async getProcessInstanceVariableByName(processInstanceId, name){
        const variable=  await this.repo.findOne({processInstanceId: processInstanceId, name})
        let objVar = {
            id: variable._id,
            name: variable.name,
            type : variable.type,
            wpid: variable.wpid,
            value: variable.value,
            processInstanceId: processInstanceId,
        }

        VariableEncoder.transcodeVariableValue(objVar)
        return  objVar;
    }

}