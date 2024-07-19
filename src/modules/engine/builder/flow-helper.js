import path from "path";
import nunjucks from "nunjucks";

export class FlowHelper {
    static createFlow(
        processInstanceBuildContext,
        currentNode,
    ) {
        nunjucks.configure({
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });
        const createFlowTemplate = nunjucks.renderString(
           `async {{ nodeType }}CreateFlow( incomingFlow , __localMethodContext ) {
              return {
                         processInstanceId: this.__metaInfo.processInstanceId,
                        id: incomingFlow.id,
                        type: incomingFlow.type,
                        to: {
                            type: 'IntermediateCatchEvent',
                            id: incomingFlow.to.id,
                        },
                        nodeSession: __localMethodContext.nodeSession,
                        status: ProcessInstanceStatus.Completed,
              }
            }`,
            {
                nodeType: currentNode.type,
            },
        );

        const createFlowMethod = processInstanceBuildContext.serviceClass.getMethod(
            `${currentNode.type}CreateFlow`,
        );
        if (!createFlowMethod) {
            processInstanceBuildContext.serviceClass.addMember(createFlowTemplate);
        }
    }
}