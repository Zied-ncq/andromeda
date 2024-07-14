import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";
import WorkflowBuilder from "../../workflow.builder.js";

const Logger = AndromedaLogger;

export class SubProcessNodeProcessor {

    static type = AType.SubProcess

    async process(currentNode, workflowCodegenContext, containerParsingContext, process) {

        Logger.info(`processing SubProcess`);

        const nodeContext = {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            body: ``,
        };
        // const workflowBuilder = new WorkflowBuilder()
       // await workflowBuilder.generateWorkflow(process, containerParsingContext, workflowCodegenContext);
        return nodeContext;

    }
}

export default SubProcessNodeProcessor;