import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";

const Logger = new AndromedaLogger();

class EndNodeProcessor {
    static type = AType.EndEvent
    process(currentNode, workflowCodegenContext, containerParsingContext, process){
        Logger.info(`processing start event`);
        return {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            body: ``,
        };
    }
}

export default EndNodeProcessor;