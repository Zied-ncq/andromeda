
import {AndromedaLogger} from "../../../config/andromeda-logger.js";
import StartNodeProcessor from "./processors/start.node.processor.js";
import EndNodeProcessor from "./processors/end.node.processor.js";
import ScriptTaskNodeProcessor from "./processors/script.node.processor.js";
import path from "path";
import nunjucks from "nunjucks";
import fs from "fs";
import {fileURLToPath} from "url";
import SubprocessNodeProcessor from "./processors/subprocess.node.processor.js";
import {FlowHelper} from "./flow-helper.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Logger = AndromedaLogger;

class BpmnProcessor {

    processors = {}
    treatedNodes=[]

    constructor() {
        this.processors[StartNodeProcessor.type] = new StartNodeProcessor();
        this.processors[EndNodeProcessor.type] = new EndNodeProcessor();
        this.processors[ScriptTaskNodeProcessor.type] = new ScriptTaskNodeProcessor();
        this.processors[SubprocessNodeProcessor.type] = new SubprocessNodeProcessor();
    }

    /**
     *
     * @param elementId {string}
     * @param workflowCodegenContext  {WorkflowCodegenContext}
     * @param containerParsingContext {ContainerParsingContext}
     */
    async process(elementId, workflowCodegenContext, containerParsingContext, process) {

        const element = process.nodes.find(e => e.id === elementId)
        const type = element.type;

        let processor = this.processors[type];
        if (!processor) {
            throw new Error(`cannot find suitable processor for Element of type ${type}`);
        }
        const nodeContext = await processor.process(element, workflowCodegenContext, containerParsingContext, process);

        if (processor.createFlow) {
            processor.createFlow();
        } else {
            FlowHelper.createFlow(workflowCodegenContext, element)
        }

        if (!nodeContext) {
            throw new Error(`cannot find a suitable node context for Element of type ${type}`);
        }
        this.buildMethod(element, nodeContext, workflowCodegenContext);

        for (const flow of element.flows) {
            if (!this.treatedNodes.includes(flow.id)) {
                this.treatedNodes.push(flow.id);
                Logger.info(
                    `next element id= ${flow.id}, type =${flow.to}`,
                );

                this.process(flow.to.id, workflowCodegenContext, containerParsingContext, process);
            }
        }
    }


    getNextNodes(
        node
    ) {
        if (node.flows !== undefined) {
            return node.flows;
        }
        return [];
    }

    buildMethod(
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
                        './templates/build.method.njk',
                    )
                    .toString(),
            ).toString(),
            {
                outgoingSequenceFlows: outgoingSequenceFlows,
                nodeContext: nodeContext,
                stringify: JSON.stringify,
            },
        );
        // inject generated method inside service class using ts-morph
        workflowCodegenContext.serviceClass.addMember(methodBody);
    }


}

export default BpmnProcessor;