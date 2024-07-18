import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";

const Logger = AndromedaLogger;
class StartNodeProcessor {
    static type = AType.StartEvent
    process(currentNode, workflowCodegenContext, containerParsingContext, process){

        Logger.info(`processing start event`);
        const nodeContext = {
            id: currentNode.id,
            type: currentNode.type,
            name: currentNode.name || currentNode.id,
            body: ``,
        };

        const bootstrapMethod =workflowCodegenContext.serviceClass.getMethodOrThrow('bootstrap');
        bootstrapMethod.addStatements(
            `
            Object.keys(variables).forEach(v => {
                this.variables.__metaVariables.forEach(metaVar => {
                    if (v === metaVar.name) {
                        metaVar.setValue(variables[v]);
                    }
                });
            });
            this.fn_${currentNode.id}()
            `,
        );
        return nodeContext;

    }
}

export default StartNodeProcessor;