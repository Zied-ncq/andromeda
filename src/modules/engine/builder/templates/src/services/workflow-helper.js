import {PersistenceGateway} from "../modules/persistence/event-store/persistence-gateway.js";
import ContainerService from "../modules/container/container.service.js";
import  {AndromedaLogger} from "../config/andromeda-logger.js";
const Logger = AndromedaLogger;
export class WorkflowHelper{

    service

    constructor(service) {
        this.service = service;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async closeProcessInstanceEvent(){
        Logger.info(`Completing process Instance id=${this.service.__metaInfo.processInstanceId}`)
        await PersistenceGateway.closeProcessInstance(
            this.service.__metaInfo.processInstanceId,
            ContainerService.containerId);
    }


    /**
     *
     * @param flowId {string}
     * @returns {Promise<void>}
     */
    async failProcessInstance(flowId){
        await PersistenceGateway.failProcessInstance(flowId,  ContainerService.containerId)

    }

    cleanProcessInstanceIfItsNotRunning(context) {
        Logger.debug(`trying to clean process instance in method ${context.nodeId}, from the container ${ContainerService.containerId}`);
        let processInstance = ContainerService.processInstances.get(this.service.__metaInfo.processInstanceId);
        if(!processInstance){
            Logger.trace(` process instance with id=${this.service.__metaInfo.processInstanceId}, was not found or deleted`);
            return;
        }else{
            let currentlyUsedFunctions= Array.from(processInstance.currentlyUsedFunctions.values());
            Logger.trace(`process instance ${JSON.stringify(processInstance.currentlyUsedFunctions)} has been cleaned or not found or deleted`);

            if(!currentlyUsedFunctions.includes(true)){
                Logger.trace(`process instance ${this.service.__metaInfo.processInstanceId} is not used anymore ==> Deleting process instance '${this.service.__metaInfo.processInstanceId}' reference from registry `);
                ContainerService.processInstances.delete(this.service.__metaInfo.processInstanceId);
            }else{
                Logger.trace(`cannot free current process instance ${this.service.__metaInfo.processInstanceId}`);
            }
        }
    }

    //
    //
    // async abortProcessInstanceEvent(){
    //     const event = {
    //         createdAt: new Date(),
    //         eventType: ABORT_PROCESS_INSTANCE,
    //         payload: {
    //             processInstanceId: this._metaInfo.processInstanceId,
    //         },
    //         version: 1.0,
    //     };
    //     await this._metaInfo.eventStore.insert(event);
    // }
}