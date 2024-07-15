import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {AType} from "./a-node-type.js";
import WorkflowBuilder from "../../workflow.builder.js";
import ContainerCodegenModel from "../../../../model/codegen/containerCodegenModel.js";
import nunjucks from "nunjucks";
import path from "path";
import fs from "fs";

const Logger = AndromedaLogger;
import {fileURLToPath} from "url";
import {ProcessHelper} from "./process-helper.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SubProcessNodeProcessor {

    static type = AType.SubProcess

    /**
     *
     * @param currentNode {ANode}
     * @param workflowCodegenContext {CodegenContext}
     * @param containerParsingContext {ContainerParsingContext}
     * @param process
     * @returns {Promise<{name: *, id, type: string, body: string}>}
     */
    async process(currentNode, workflowCodegenContext, containerParsingContext, process) {

        Logger.info(`processing SubProcess`);



        const nodeContext = {
            id: currentNode.id,
            type: AType.SubProcess,
            name: currentNode.name || currentNode.id,
            body: ``,
        };

        for (let sub of process.subProcesses) {
            const containerCodegenModel = new ContainerCodegenModel();
            const workflowBuilder = new WorkflowBuilder(containerCodegenModel)
            await workflowBuilder.generateWorkflow(sub, containerParsingContext, containerCodegenModel);

            const normalizedProcessDef = ProcessHelper.normalizeProcessDefWithoutVersion(sub.id);

            workflowCodegenContext.addServiceClassImport(`${ProcessHelper.upperFirstChar(normalizedProcessDef)}ProcessInstanceService`,`../services/${normalizedProcessDef.toLowerCase()}.process-instance.service.js`)
        }
        await this.buildResumeAfterSubProcessEnds(workflowCodegenContext, currentNode, nodeContext);




        return nodeContext;

    }

    postProcess(currentNode, workflowCodegenContext, containerParsingContext, process){
        for (let sub of process.subProcesses) {
            const containerCodegenModel = new ContainerCodegenModel();
            const workflowBuilder = new WorkflowBuilder(containerCodegenModel)

            const bootstrapMethod =workflowCodegenContext.serviceClass.getMethodOrThrow(`fn_${sub.id}`);

            const startElements = workflowBuilder.getStartElements(sub)
            for (let startElement of startElements) {
                bootstrapMethod.addStatements(
                    `
                  try {
                        const subProcess = new SubiProcessInstanceService(this.processInstanceId, flowModel, this)
                        await subProcess.fn_${startElement.id}(flowModel);
                  } catch (_bpmnProcessorException) {
                    Logger.error(_bpmnProcessorException)
                    const stack = _bpmnProcessorException.stack;
                    throw new Error(JSON.stringify({ stacktrace: stack, context: __localMethodContext }));
                  }`,
                );
            }

            console.log(`--->`)
        }
    }

    async buildResumeAfterSubProcessEnds(workflowCodegenContext, currentNode, nodeContext) {
        const fnResumeMethod = workflowCodegenContext.serviceClass.addMember(`async fn_resume_sub_process_${currentNode.id}(flowModel){}`);
        let localContextTemplate = `
          let __localMethodContext = {
            nodeSession: crypto.randomUUID(),
            nodeId: '{{ nodeContext.id }}',
            nodeName: '{{ nodeContext.name }}',
            type: '{{ nodeContext.type }}',
            incomingFlowId: flowModel?.id
          }
        `
        nunjucks.configure(path.join(__dirname, './templates'), {
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });
        const localContext = nunjucks.renderString(localContextTemplate, {
            nodeContext: nodeContext,
            stringify: JSON.stringify,
        });

        fnResumeMethod.addStatements(
            localContextTemplate
        );

        fnResumeMethod.addStatements(
            await this.buildSubProcessResumeMethod(currentNode, nodeContext, workflowCodegenContext),
        );
    }

    getNextNodes(node) {
        if (node.flows !== undefined) {
            return node.flows;
        }
        return [];
    }

    buildSubProcessResumeMethod(
        currentElement,
        nodeContext,
        workflowCodegenContext,
    ) {
        const nextNodes = this.getNextNodes(currentElement);
        Logger.trace(`Generate method signature for node  ${currentElement.id}`);
        const outgoingSequenceFlows = nextNodes.map(
            (nextNode) => {
                const flow = {
                    ...nextNode,
                };
                flow.targetNodeMethodSignature = `this.fn_${flow.to.id}(nextFlowModel)`;
                return flow;
            },
            // this.generateOutgoingSequenceFlowContext(currentElement, nextNode),
        );

        nunjucks.configure( path.join(  __dirname,'./templates'), {
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });
        const methodBody = nunjucks.renderString(
            fs.readFileSync(
                path
                    .join(
                        __dirname,
                        '../templates/build.method.next.calls.njk',
                    )
                    .toString(),
            ).toString(),
            {
                outgoingSequenceFlows: outgoingSequenceFlows,
                nodeContext: nodeContext,
                stringify: JSON.stringify,
            },
        );

        return methodBody
    }
}

export default SubProcessNodeProcessor;