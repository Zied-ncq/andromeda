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
}