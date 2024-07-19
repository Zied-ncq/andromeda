import {BaseRepository} from "./baseRepository.js";

import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import VariableModel from "../internal/models/variable.orm-model.js";
const Logger = AndromedaLogger;

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
                        processInstance: processInstanceId,
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
                processInstance: processInstanceId,
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



}