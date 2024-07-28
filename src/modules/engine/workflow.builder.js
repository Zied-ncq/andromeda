
import BpmnProcessor from "./builder/bpmn.processor.js";
import {AndromedaLogger} from "../../config/andromeda-logger.js";
import fs from "fs";
import nunjucks from "nunjucks";
import CodegenContext from "../../model/codegen/codegenContext.js";
import path from "path";
import {fileURLToPath} from "url";
import Utils from "../../utils/utils.js";
import {ContainerParsingContext} from "../../model/parsing/container.parsing.context.js";
// import {WorkflowParsingContext} from "../../model/parsing/workflow.parsing.context.js";
import BPMNModdle from "bpmn-moddle";
import {AProcess} from "../../model/domain-model/bzprocess/a-process.js";
import {BpmnConverter} from "./model-converters/bpmn-converter.js";
import {ProcessHelper} from "./builder/processors/process-helper.js";

const Logger = AndromedaLogger;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkflowBuilder {

    codegenContext

    nodeDefinitions

    bpmnProcessor

    constructor(containerCodegenModel, nodeDefinitions) {
        if(containerCodegenModel === undefined){
            throw new Error(`containerCodegenModel cannot be null`)
        }
        this.codegenContext = new CodegenContext(containerCodegenModel);
        this.nodeDefinitions = nodeDefinitions;
        this.bpmnProcessor = new BpmnProcessor(this.nodeDefinitions || {});
    }



    normalizeWpidWithoutVersion(wpid) {
        const result = wpid;
        const regex = /(\w+)(-[vV][0-9]+\.[0-9]+)/;
        return result.replace(regex, `$1`);
    }



    async generateContainer(element, containerParsingContext) {
        let self = this;
        // search start
        // generate code
        const startElements = this.getStartElements(element);
        startElements.forEach(startElement => {
            self.generate(startElement.id, containerParsingContext);
        })
        // let embeddedEventSubprocesses = this.getEventSubProcess(element);
        // embeddedEventSubprocesses.forEach(container => {
        //     self.generateContainer(container, workflowCodegenContext, containerParsingContext)
        // })
    }

    /**
     *
     * @param element  {string}
     * @param containerParsingContext {ContainerParsingContext}
     * @param process {AProcess}
     * @returns {Promise<void>}
     */
    async generate(element, containerParsingContext, process) {
        await
            this.bpmnProcessor.process(element, this.codegenContext, containerParsingContext, process);
    }


    /**
     *
     * @param filesContent
     * @param wpid {string} workflow process id
     * @param version {string} workflow process version
     * @returns {Promise<ContainerParsingContext>}
     */
    static async prepareBpmnContainerContext(filesContent, wpid, version) {
        const ctx = new ContainerParsingContext({
            isTestContainer: false,
            filesContent
        });
        for(let index in filesContent){
            // const workflowParsingContext = new WorkflowParsingContext()
            const model = await new BPMNModdle().fromXML(filesContent[index]);
            const aModel = this.convertBpmnToGenericModel(model, version)
            // workflowParsingContext = aModel;
            // workflowParsingContext.processPrefix= Utils.upperFirstChar(Utils.normalizeProcessPrefixWithoutVersion(workflowParsingContext.model.id))
            ctx.workflowParsingContext.push(aModel);
        }
        ctx.wpid = wpid;
        ctx.version = version;

        // by default activate web and persistence modules
        ctx.includePersistenceModule = true;
        ctx.includeWebModule = true;

        return ctx;
    }

    /**
     * @param {Definitions} model
     * @param {string} version
     * @returns {AProcess}
     */
    static convertBpmnToGenericModel(model, version){
        return  new BpmnConverter().convert(model, version);
    }

    /**
     * entry point for code generation
     * @param model  {AProcess}
     * @param containerParsingContext  {ContainerParsingContext}
     * @param containerCodegenModel  {ContainerCodegenModel}
     * @returns {Promise<void>}
     */
    async generateWorkflow(
        model,
        containerParsingContext,
        containerCodegenModel
    ) {
        // each bpmn file can contain multiple process node
        // const processesInBpmnFile = this.getProcessesModel(processModel.model);

        const nwpid = this.normalizeWpidWithoutVersion(model.id);



        await this.generateServiceClass(nwpid, model, containerParsingContext )
        await this.generateWorkflowContext(nwpid, model, containerParsingContext)

        await this.generateContainerControllerClass(nwpid, model, containerParsingContext)

        // processesInBpmnFile.forEach(process => {
        // current node = definition
        await this.generateProcess(model, containerParsingContext);

        // });

        containerCodegenModel.renderRoutes(nwpid, containerParsingContext);
        this.codegenContext.renderImports()
        this.codegenContext.serviceClassFile.formatText({
            placeOpenBraceOnNewLineForFunctions: true,
        });
        await this.codegenContext.project.saveSync();


        // for each process create a start method

        // in each start method
        // call event subprocess start method
        // call start node (simple start)

        // detect
        // simple start
        // event based start (all types) scheduled, message ....
        // process each node and all the nodes linked to it
        // process all the nodes in an adhoc subprocess


        // const buildContext = new ProcessInstanceBuildContext();
        // this.generateServiceClass(wpid, buildContext, containerParsingContext);
        // // this.generateVariableContextHandlerClass(wpid, containerParsingContext);
        // this.generateControllerClass(wpid, buildContext, containerParsingContext);
        // this.generateVariable(
        //   processesInBpmnFile,
        //   this.normalizeWpidWithoutVersion(wpid),
        //   buildContext,
        //   containerParsingContext,
        // );
        // // this.createWorkflowWorker(wpid, containerParsingContext);
        // startElements.forEach((startElement) => {
        //   this.generateContentForElement(startElement, buildContext);
        // });
        // buildContext.renderImports();
        // buildContext.serviceClassFile.formatText({ trimTrailingWhitespace: true });
        // buildContext.controllerClass.formatText({ trimTrailingWhitespace: true });
        // buildContext.project.saveSync();
    }

    /**
     *
     * @param {string} nwpid
     * @param parsedModel
     * @param {ContainerParsingContext} containerParsingContext
     * @returns {Promise<void>}
     */
    async generateServiceClass(
        nwpid,
        parsedModel,
        containerParsingContext,
    ) {

        const serviceFileName = this.getServiceFileName(nwpid);
        const serviceClassName = this.getServiceClassName(nwpid);
        nunjucks.configure({
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });

        const deploymentPath = Utils.getDeploymentPath(containerParsingContext)
        let serviceFilePath = `${deploymentPath}/src/services/${serviceFileName}.js`

        let template = fs.readFileSync(
            path.join(__dirname,'./builder/templates/src/services/service.njk').toString(),
        ).toString();

        const renderedTemplate = nunjucks.renderString(
            template,
            {
                ServiceFileName: serviceFileName,
                ServiceClassName: serviceClassName,
                version: containerParsingContext.version,
                nwpid,
                cnwpid: ProcessHelper.upperFirstChar(nwpid),
                containerParsingContext,
                workflowCodegenContext: this.codegenContext,
                process: parsedModel
            },
        );

        this.codegenContext.serviceClassFile = this.codegenContext.project.createSourceFile(
            serviceFilePath,
            renderedTemplate,
            {
                overwrite: true
            },
        );
        this.codegenContext.serviceClass = this.codegenContext.serviceClassFile.getClassOrThrow(serviceClassName)
    }



    /**
     *
     * @param {string} nwpid
     * @param parsedModel
     * @param {ContainerParsingContext} containerParsingContext
     * @returns {Promise<void>}
     */
    async generateWorkflowContext(
        nwpid,
        parsedModel,
        containerParsingContext) {

        nunjucks.configure({
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });


        let template = fs.readFileSync(
            path
                .join(
                    __dirname,
                    './builder/templates/src/services/process-instance-context.js.njk',
                )
                .toString(),
        ).toString()

        const renderedTemplate = nunjucks.renderString(
            template,
            {
                cnwpid: ProcessHelper.upperFirstChar(nwpid),
                wpid: ProcessHelper.upperFirstChar(nwpid),
                version: containerParsingContext.version,
                processVariables: parsedModel.variables
            },
        );

        let destFile = path.join(Utils.getDeploymentPath(containerParsingContext), "src", "services", `${nwpid}.process-instance-context.js`);
        fs.writeFileSync(
            destFile,
            renderedTemplate,
        );

    }

    /**
     *
     * @param process  {AProcess}
     * @param containerParsingContext {ContainerParsingContext}
     */
    async generateProcess(process, containerParsingContext) {
        let startElements = this.getStartElements(process);
        for (const startElement of startElements) {
            await this.generate(startElement.id, containerParsingContext, process);
        }

        // let embeddedEventSubprocesses = this.getEventSubProcess(process);
        // for (const container of embeddedEventSubprocesses) {
        //     await this.generateContainer(container, workflowCodegenContext, containerParsingContext)
        // }
    }


    /**
     *
     * @param nwpid {string}
     * @returns {string}
     */
    getServiceFileName(nwpid) {
        return nwpid.toLowerCase() + '.process-instance.service';
    }

    getServiceClassName(nwpid) {
        return ProcessHelper.upperFirstChar(nwpid) + 'ProcessInstanceService';
    }


    getStartElements(bpmnProcess) {
        if (!bpmnProcess) {
            throw new Error(
                `cannot compile file missing a process in the root elements`,
            );
        }
        // message start event + (non interrupting)
        // Timer start event + (non interrupting)
        // conditional start event + (non interrupting)
        // signal start event + (non interrupting)
        // error start event
        // Escalation start event + (non interrupting)
        // Compensation start event

        // search event subprocess, because they are triggered automatically
        return (
            bpmnProcess.nodes.filter(
                (e) =>
                    e.type === 'StartEvent'
            )
        );
    }

    getEventSubProcess(bpmnProcess) {
        if (!bpmnProcess) {
            throw new Error(
                `cannot compile file missing a process in the root elements`,
            );
        }

        // search event subprocess, because they are triggered automatically
        const x =
            bpmnProcess.nodes.filter(
                (e) =>
                    e.type === 'SubProcess' // && e.triggeredByEvent === true
            );
        return x;
    }

    // getProcessesModel(model) {
    //     return model.rootElement.rootElements.filter((e) => e.$type === 'bpmn:Process');
    // }

    /**
     *
     * @param {string} nwpid
     * @param {AProcess} bpmnModel
     * @param {ContainerParsingContext} containerParsingContext
     */
    generateContainerControllerClass(nwpid, bpmnModel, containerParsingContext) {
            const controllerName= `${ProcessHelper.upperFirstChar(nwpid)}Controller`
        nunjucks.configure({
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });

        this.codegenContext.containerCodegenModel.openApiCodegen.addPath("/start/process/{wpid}/version/{version}" , "post")
        this.codegenContext.containerCodegenModel.openApiCodegen.addPathVariableParameter("/start/process/{wpid}/version/{version}" , "post", 'wpid', 'string')
        this.codegenContext.containerCodegenModel.openApiCodegen.addResponse("/start" , "post" , {
            "responses": {
                "200": {
                    "description": "Process instance id"
                },
                // "requestBody": {
                //     "required": true,
                //     "content": {
                //         "multipart/form-data": {
                //             "schema": {
                //                 "type": "object",
                //                 "properties": {
                //                     "wpid": {
                //                         "type": "string"
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        })
        this.codegenContext.containerCodegenModel.routes.push({verb: "POST", path: "/start/process/:wpid/version/:version" , method: "start"})


        this.codegenContext.containerCodegenModel.openApiCodegen.addPath("/process-instance/{processInstanceId}/status" , "get")
        this.codegenContext.containerCodegenModel.openApiCodegen.addPathVariableParameter("/process-instance/{processInstanceId}/status" , "get", 'processInstanceId', 'string')
        this.codegenContext.containerCodegenModel.openApiCodegen.addResponse("/process-instance/{processInstanceId}/status" , "get" , {
            "responses": {
                "200": {
                    "description": "Process instance id"
                },
                // "requestBody": {
                //     "required": true,
                //     "content": {
                //         "multipart/form-data": {
                //             "schema": {
                //                 "type": "object",
                //                 "properties": {
                //                     "wpid": {
                //                         "type": "string"
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        })

        const deploymentPath = Utils.getDeploymentPath(containerParsingContext)
        let serviceFilePath = `${deploymentPath}/src/controllers/${controllerName}.js`

        let template = fs.readFileSync(
            path
                .join(
                    __dirname,
                    './builder/templates/src/controllers/controller.njk',
                )
                .toString(),
        ).toString()
        const renderedTemplate = nunjucks.renderString(
            template,
            {
                ControllerFileName: controllerName,
                ControllerClassName: controllerName,
                startMethod : { name: nwpid},
                Wpid: nwpid,
                containerParsingContext,
                workflowCodegenContext: this.codegenContext,
            },
        );
        this.codegenContext.addControllerClassImport(`${nwpid}ProcessInstanceService`,`../services/${nwpid.toLowerCase()}.process-instance.service.js`)
        this.codegenContext.controllerClassFile = this.codegenContext.project.createSourceFile(
            serviceFilePath,
            renderedTemplate,
            {overwrite: true},
        );
        this.codegenContext.controllerClass  = this.codegenContext.controllerClassFile.getClassOrThrow(controllerName)

    }


}

export default WorkflowBuilder;