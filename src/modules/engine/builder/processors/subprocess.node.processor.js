import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";

const Logger = AndromedaLogger;
class StartNodeProcessor {

    static type = AType.SubProcess

    process(currentNode, workflowCodegenContext, containerParsingContext, process){

        Logger.info(`processing SubProcess`);

        const nodeContext = {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            body: ``,
        };

        return nodeContext;

    }
}

export default StartNodeProcessor;