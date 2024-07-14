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
        Logger.info(`Completing process Instance id=${this.service.processInstanceId}`)
        await PersistenceGateway.closeProcessInstance(
            this.service.processInstanceId,
            ContainerService.containerId);
    }


    /**
     *
     * @param flowId {string}
     * @param localMethodContext {{nodeName: string, incomingFlowId: *, nodeSession: `${string}-${string}-${string}-${string}-${string}`, type: string, nodeId: string}}
     * @returns {Promise<void>}
     */
    async failProcessInstance(flowId, localMethodContext){
        await PersistenceGateway.failProcessInstance(flowId,  ContainerService.containerId)

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