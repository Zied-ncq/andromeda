import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";

const Logger = AndromedaLogger;

class EndNodeProcessor {
    static type = AType.EndEvent

    /**
     *
     * @param currentNode
     * @param workflowCodegenContext
     * @param containerParsingContext
     * @param process {AProcess}
     * @returns {{name: *, id, type, body: string}}
     */
    process(currentNode, workflowCodegenContext, containerParsingContext, process){
        Logger.info(`processing start event`);

        let body = `
        this.endNodeIsReached = true;
        await this.workflowhelper.closeProcessInstanceEvent();`
        if(process.hasParentProcess){
            body = `
            this.endNodeIsReached = true;
            await this.parentProcessInstance.fn_resume_sub_process_${process.id}(this.flowModel);
            `
        }

        return {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            body,
        };
    }
}

export default EndNodeProcessor;