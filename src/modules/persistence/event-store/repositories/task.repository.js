import {BaseRepository} from "./baseRepository.js";

import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import TaskModel from "../internal/models/task.orm-model.js";
import {ProcessInstanceStatus} from "../internal/models/process-instance.orm-model.js";
const Logger = AndromedaLogger;

export class TaskRepository {

    /**
     * @type {BaseRepository}
     */
    repo;

    constructor() {
        this.repo= new BaseRepository(TaskModel)
    }

    isPrimitive(val) {
        return val !== Object(val);
    }


   async createNewCatchEventTask(processInstanceId, signalId){
       Logger.info(`create new catch event task for processInstance  ${processInstanceId}`);
       // @type {ProcessInstance}
       let processInstance= {
           _id: crypto.randomUUID(),
           processInstanceId,
           signalId,
           type:'catch_event',
           status: ProcessInstanceStatus.Active,

       }
       await this.repo.create(processInstance)
   }


}