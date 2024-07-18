import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";

const Logger = AndromedaLogger;
class CatchEventNodeProcessor {
    static type = AType.CatchEvent

    /**
     *
     * @param currentNode {ANode}
     * @param workflowCodegenContext {CodegenContext}
     * @param containerParsingContext {ContainerParsingContext}
     * @param process {AProcess}
     * @returns {{name: *, id, type, body: *}}
     */
    process(currentNode, workflowCodegenContext, containerParsingContext, process){

        Logger.info(`processing CatchEventNodeProcessor node`);
        const nodeContext = {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            body: currentNode.content.script,
        };


        return nodeContext;

    }
}

export default CatchEventNodeProcessor;