import AndromedaLogger from "../../../../config/andromeda-logger.js";
import {ProcessInstanceRepository} from "../repositories/process-instance.repository.js";
import {EventTypes} from "../event-types.js";
import {VariableRepository} from "../repositories/variable.repository.js";

const Logger = AndromedaLogger;
export class ProcessInstanceProjection {

    /**
     *
     * @type {ProcessInstanceRepository}
     */
    processInstanceRepo = new ProcessInstanceRepository();
    variableRepository = new VariableRepository();



    async process(event) {
        if (event.type === EventTypes.CLOSE_PROCESS_INSTANCE) {
            Logger.trace("Complete process instance")
            await this.processInstanceRepo.completeProcessInstance(event.data.id);
        }
        if (event.type === EventTypes.CREATE_PROCESS_INSTANCE) {
            Logger.trace("creating new process instance")

            await this.processInstanceRepo.createNewProcessInstance(event.data.id, event.data.wpid, event.data.version, event.data.containerId);
        }

        if (event.type === EventTypes.FAIL_PROCESS_INSTANCE) {
            Logger.trace("Failing process instance")
            await this.processInstanceRepo.failProcessInstance(event.data.id);
        }

        if (event.type === EventTypes.CREATE_PROCESS_VARIABLES) {
            Logger.trace("Creating variables")
            await this.variableRepository.bulkUpsertVariables(event.data.variables, event.data.processInstanceId, event.data.wpid);
        }

        // console.dir(event)
    }
}