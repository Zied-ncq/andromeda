import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";

const Logger = AndromedaLogger;
class ExclusiveGatewayNodeProcessor {
    static type = AType.ExclusiveGateway
    process(currentNode, workflowCodegenContext, containerParsingContext, process){

        Logger.info(`processing exclusive gateway`);

        const nodeContext = {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            forceOutgoingFlow: {
                mode: "maximum",
                number: 1
            },
            body: ``,
        };


        return nodeContext;

    }
}

export default ExclusiveGatewayNodeProcessor;