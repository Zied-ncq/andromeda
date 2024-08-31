import {BaseRepository} from "./baseRepository.js";

import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import ProcessInstanceModel, {ProcessInstanceStatus} from "../internal/models/process-instance.orm-model.js";
const Logger = AndromedaLogger;

export class ProcessInstanceRepository {

    /**
     * @type {BaseRepository}
     */
    repo;

    constructor() {
        this.repo= new BaseRepository(ProcessInstanceModel)
    }

    /**
     *
     * @param {string} processInstanceId
     * @param {string} wpid
     * @param {string} version
     * @param {string} containerId
     * @returns {Promise<void>}
     */
    async createNewProcessInstance(processInstanceId,wpid, version, containerId) {
        Logger.info(`create new process instance ${processInstanceId}`);
        // @type {ProcessInstance}
        let processInstance= {
            _id: processInstanceId,
            wpid: wpid,
            version,
            status: ProcessInstanceStatus.Active,
            lock: {
                containerId: containerId,
                date: new Date()
            }
        }
        await this.repo.create(processInstance)
    }

    /**
     *
     * @param {string} processInstanceId
     * @returns {Promise<void>}
     */
    async removeLock(processInstanceId){
        Logger.info(`updating process instance ${processInstanceId}, set lock to null`);
        await this.repo.upsert({_id: processInstanceId}, {lock: null})
    }

    async completeProcessInstance(processInstanceId){
        Logger.info(`updating process instance ${processInstanceId}, set lock to null and status = ${ ProcessInstanceStatus.Completed}`);
        await this.repo.upsert({_id: processInstanceId}, {status: ProcessInstanceStatus.Completed, lock: null})
    }

    async failProcessInstance(processInstanceId){
        Logger.info(`Failing process instance ${processInstanceId}, set lock to null and status = ${ ProcessInstanceStatus.Error}`);
        await this.repo.upsert({_id: processInstanceId}, {status: ProcessInstanceStatus.Error, lock: null})
    }


    /**
     *
     * @param id
     * @returns {Promise<ProcessInstance>}
     */
    async getProcessInstanceById(id){
        const instance = await this.repo.findOne({_id: id})
        if(instance){
            return {
                id: instance._id,
                lock: instance.lock,
                wpid: instance.wpid,
                status: instance.status,
                version: instance.version
            }
        }
        return null;
    }

}