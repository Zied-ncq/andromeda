import {BaseRepository} from "./baseRepository.js";

import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import SequenceFlowModel from "../internal/models/sequence-flow.orm-model.js";
import sequenceFlowOrmModel from "../internal/models/sequence-flow.orm-model.js";
const Logger = AndromedaLogger;

export class SequenceFlowRepository {

    /**
     * @type {BaseRepository}
     */
    repo;

    constructor() {
        this.repo= new BaseRepository(SequenceFlowModel)
    }

    isPrimitive(val) {
        return val !== Object(val);
    }


    async bulkUpsertSequenceFlows(
        sequenceFlows
    ) {
        const bulkOpBody = sequenceFlows.map((sequenceFlow) => {
            const record = {
                insertOne: {
                    document: {
                        _id: crypto.randomUUID(),
                        flowId: sequenceFlow.id,
                        to: sequenceFlow.to,
                        nodeSession: sequenceFlow.nodeSession,
                        executable: sequenceFlow.executable,
                        status: sequenceFlow.status,
                        processInstanceId: sequenceFlow.processInstanceId,
                    },
                },
            };
            return record;
        });
        return await sequenceFlowOrmModel.bulkWrite(bulkOpBody, {
            ordered: true,
        });

    }



}