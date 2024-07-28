import path from "path";
import nunjucks from "nunjucks";

export class FlowHelper {
    static createFlow(
        processInstanceBuildContext,
        currentNode,
    ) {

        const createFlowMethod = processInstanceBuildContext.serviceClass.getMethod(
            `${currentNode.type}CreateFlow`,
        );
        if (!createFlowMethod) {
            processInstanceBuildContext.serviceClass.addMember(FlowHelper.createFlowTemplate(currentNode.type));
        }
    }

    /**
     *
     * @param nodeType {string}
     * @param suffix {string}
     * @returns {*}
     */
    static createFlowTemplate(
        nodeType,
        suffix
    ) {

        return this.createFlowTemplateUsingFlow(nodeType, {
            suffix: suffix || '',
            status: 'ProcessInstanceStatus.Completed'
        })
    }

    static createFlowTemplateUsingFlow(
        nodeType,
        flow
    ) {
        nunjucks.configure({
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });
        return  nunjucks.renderString(
            `async {{ nodeType }}CreateFlow{{suffix}}( incomingFlow , __localMethodContext ) {
              return {
                        processInstanceId: this.__metaInfo.processInstanceId,
                        id: incomingFlow.id,
                        type: incomingFlow.type,
                        to: {
                            type: '${nodeType}',
                            id: incomingFlow.to.id,
                        },
                        nodeSession: __localMethodContext.nodeSession,
                        status: {{status}},
              }
            }`,
            {
                nodeType,
                suffix: flow.suffix || '',
                status: flow.status || 'ProcessInstanceStatus.Completed',
            },
        );
    }


}