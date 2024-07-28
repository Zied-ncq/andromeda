
import {AndromedaLogger} from "../../../config/andromeda-logger.js";
import StartNodeProcessor from "./processors/start.node.processor.js";
import EndNodeProcessor from "./processors/end.node.processor.js";
// import ScriptTaskNodeProcessor from "./processors/script.node.processor.js";
import path from "path";
import nunjucks from "nunjucks";
import fs from "fs";
import {fileURLToPath} from "url";
import SubprocessNodeProcessor from "./processors/subprocess.node.processor.js";
import {FlowHelper} from "./flow-helper.js";
import DynamicProcessor from "./processors/dynamic-processor.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Logger = AndromedaLogger;





class BpmnProcessor {

    processors = {}
    treatedNodes=[]
    nodeDefinitions


    constructor(nodeDefinitions) {
        this.nodeDefinitions = nodeDefinitions
        this.processors[StartNodeProcessor.type] = new StartNodeProcessor();
        this.processors[EndNodeProcessor.type] = new EndNodeProcessor();
        this.processors[SubprocessNodeProcessor.type] = new SubprocessNodeProcessor();
        this.registerDynamicProcessor(nodeDefinitions)
    }

    /**
     *
     * @param elementId {string}
     * @param workflowCodegenContext  {CodegenContext}
     * @param containerParsingContext {ContainerParsingContext}
     */
    async process(elementId, workflowCodegenContext, containerParsingContext, process) {

        const element = process.nodes.find(e => e.id === elementId)
        const type = element.type;

        let processor = this.processors[type];
        if (!processor) {
            throw new Error(`cannot find suitable processor for Element of type ${type}`);
        }
        const processorContext = await processor.process(element, workflowCodegenContext, containerParsingContext, process);



        if (!processorContext) {
            throw new Error(`cannot find a suitable node context for Element of type ${type}`);
        }

        let codegenNodeContexts;
        if(!Array.isArray(processorContext)){
            codegenNodeContexts = [processorContext];
        }else{
            codegenNodeContexts=processorContext
        }
        codegenNodeContexts.forEach(nc => {
            this.buildMethod(element, nc, workflowCodegenContext);
            if (nc.flow) {
                const createFlowMethod = workflowCodegenContext.serviceClass.getMethod(
                    `${nc.type}CreateFlow${nc.flow.suffix}`,
                );
                if (!createFlowMethod) {
                    workflowCodegenContext.serviceClass.addMember(FlowHelper.createFlowTemplateUsingFlow(nc.type, nc.flow));
                }
                // console.log(FlowHelper.createFlowTemplate(nc.type, nc.flow.suffix))
            } else {
                FlowHelper.createFlow(workflowCodegenContext, element)
            }
        })


        if(processor.postProcess){
            processor.postProcess(element, workflowCodegenContext, containerParsingContext, process)
        }


        for (const flow of element.flows) {
            if (!this.treatedNodes.includes(flow.id)) {
                this.treatedNodes.push(flow.id);
                Logger.info(
                    `next element id= ${flow.id}, type =${flow.to}`,
                );

                await this.process(flow.to.id, workflowCodegenContext, containerParsingContext, process);
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
        const outgoingSequenceFlows = nextNodes;

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


    registerDynamicProcessor(nodeDefinitions) {
        for (let key of Object.keys(nodeDefinitions)) {
            this.processors[key] = new DynamicProcessor(nodeDefinitions[key])
        }
    }
}

export default BpmnProcessor;