
import BpmnProcessor from "./builder/bpmn.processor.js";
import {AndromedaLogger} from "../../config/andromeda-logger.js";
import fs from "fs";
import nunjucks from "nunjucks";
import WorkflowCodegenContext from "../../model/codegen/workflow.codegen.context.js";
import path from "path";
import {fileURLToPath} from "url";
import Utils from "../../utils/utils.js";
import {Config} from "../../config/config.js";
import {ContainerParsingContext} from "../../model/parsing/container.parsing.context.js";
import {WorkflowParsingContext} from "../../model/parsing/workflow.parsing.context.js";
import BPMNModdle from "bpmn-moddle";
import {AProcess} from "../../model/domain-model/bzprocess/a-process.js";
import {BpmnConverter} from "./model-converters/bpmn-converter.js";

const Logger = new AndromedaLogger();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkflowBuilder {
    constructor() {
    }

    bpmnProcessor = new BpmnProcessor();


    normalizeProcessDefWithoutVersion(processDef) {
        const result = processDef;
        const regex = /(\w+)(-[vV][0-9]+\.[0-9]+)/;
        return result.replace(regex, `$1`);
    }

    upperFirstChar(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async generateContainer(element, workflowCodegenContext, containerParsingContext) {
        let self = this;
        // search start
        // generate code
        const startElements = this.getStartElements(element);
        startElements.forEach(startElement => {
            self.generate(startElement.id, workflowCodegenContext, containerParsingContext);
        })
        // let embeddedEventSubprocesses = this.getEventSubProcess(element);
        // embeddedEventSubprocesses.forEach(container => {
        //     self.generateContainer(container, workflowCodegenContext, containerParsingContext)
        // })
    }

    /**
     *
     * @param element  {string}
     * @param workflowCodegenContext  {WorkflowCodegenContext}
     * @param containerParsingContext {ContainerParsingContext}
     * @returns {Promise<void>}
     */
    async generate(element, workflowCodegenContext, containerParsingContext, process) {
        this.bpmnProcessor.process(element, workflowCodegenContext, containerParsingContext, process);
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
            const workflowParsingContext = new WorkflowParsingContext()
            const model = await new BPMNModdle().fromXML(filesContent[index]);
            const aModel = this.convertBpmnToGenericModel(model, version)
            workflowParsingContext.model = aModel;
            workflowParsingContext.processPrefix= Utils.upperFirstChar(Utils.normalizeProcessPrefixWithoutVersion(workflowParsingContext.model.id))
            ctx.workflowParsingContext.push(workflowParsingContext);
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
     * @param processModel : WorkflowParsingContext
     * @param containerParsingContext : ContainerParsingContext
     * @param containerCodegenContext : ContainerCodegenContext
     * @returns {Promise<void>}
     */
    async generateWorkflow(
        processModel,
        containerParsingContext,
        containerCodegenContext
    ) {
        // each bpmn file can contain multiple process node
        // const processesInBpmnFile = this.getProcessesModel(processModel.model);

        const normalizedProcessDef = this.normalizeProcessDefWithoutVersion(processModel.processPrefix);

        const workflowCodegenContext = new WorkflowCodegenContext(containerCodegenContext);

        await this.generateServiceClass(normalizedProcessDef, processModel, containerParsingContext, workflowCodegenContext)
        await this.generateWorkflowContext(normalizedProcessDef, processModel, containerParsingContext)

        await this.generateContainerControllerClass(normalizedProcessDef, processModel, containerParsingContext, workflowCodegenContext)

        // processesInBpmnFile.forEach(process => {
        // current node = definition
        await this.generateProcess(processModel.model, workflowCodegenContext, containerParsingContext);

        // });

        containerCodegenContext.renderRoutes(normalizedProcessDef, containerParsingContext);
        workflowCodegenContext.renderImports()
        workflowCodegenContext.serviceClassFile.formatText({
            placeOpenBraceOnNewLineForFunctions: true,
        });
        await workflowCodegenContext.project.saveSync();


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
        // this.generateServiceClass(processDef, buildContext, containerParsingContext);
        // // this.generateVariableContextHandlerClass(processDef, containerParsingContext);
        // this.generateControllerClass(processDef, buildContext, containerParsingContext);
        // this.generateVariable(
        //   processesInBpmnFile,
        //   this.normalizeProcessDefWithoutVersion(processDef),
        //   buildContext,
        //   containerParsingContext,
        // );
        // // this.createWorkflowWorker(processDef, containerParsingContext);
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
     * @param {string} normalizedProcessDef
     * @param parsedModel
     * @param {ContainerParsingContext} containerParsingContext
     * @param {WorkflowCodegenContext} workflowCodegenContext
     * @returns {Promise<void>}
     */
    async generateServiceClass(
        normalizedProcessDef,
        parsedModel,
        containerParsingContext,
        workflowCodegenContext,
    ) {

        const serviceFileName = this.getServiceFileName(normalizedProcessDef);
        const serviceClassName = this.getServiceClassName(normalizedProcessDef);
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
                ProcessDef: normalizedProcessDef,
                containerParsingContext,
                workflowCodegenContext,
            },
        );

        workflowCodegenContext.serviceClassFile = workflowCodegenContext.project.createSourceFile(
            serviceFilePath,
            renderedTemplate,
            {
                overwrite: true
            },
        );
        workflowCodegenContext.serviceClass = workflowCodegenContext.serviceClassFile.getClassOrThrow(serviceClassName)
    }



    /**
     *
     * @param {string} normalizedProcessDef
     * @param parsedModel
     * @param {ContainerParsingContext} containerParsingContext
     * @returns {Promise<void>}
     */
    async generateWorkflowContext(
        normalizedProcessDef,
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
                ProcessDef: normalizedProcessDef,
            },
        );

        let destFile = path.join(Utils.getDeploymentPath(containerParsingContext), "src", "services", `${normalizedProcessDef.toLowerCase()}.process-instance-context.js`);
        fs.writeFileSync(
            destFile,
            renderedTemplate,
        );

    }

    /**
     *
     * @param process  {ANode}
     * @param workflowCodegenContext {WorkflowCodegenContext}
     * @param containerParsingContext {ContainerParsingContext}
     */
    async generateProcess(process, workflowCodegenContext, containerParsingContext) {
        let startElements = this.getStartElements(process);
        for (const startElement of startElements) {
            await this.generate(startElement.id, workflowCodegenContext, containerParsingContext, process);
        }

        // let embeddedEventSubprocesses = this.getEventSubProcess(process);
        // for (const container of embeddedEventSubprocesses) {
        //     await this.generateContainer(container, workflowCodegenContext, containerParsingContext)
        // }
    }


    /**
     *
     * @param normalizedProcessDef : string
     * @returns {string}
     */
    getServiceFileName(normalizedProcessDef) {
        return normalizedProcessDef.toLowerCase() + '.process-instance.service';
    }

    getServiceClassName(normalizedProcessDef) {
        return this.upperFirstChar(normalizedProcessDef) + 'ProcessInstanceService';
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
        return (
            bpmnProcess.nodes.filter(
                (e) =>
                    e.type === 'SubProcess' && e.triggeredByEvent === true
            )
        );
    }

    // getProcessesModel(model) {
    //     return model.rootElement.rootElements.filter((e) => e.$type === 'bpmn:Process');
    // }

    /**
     *
     * @param {string} normalizedProcessDef
     * @param {WorkflowParsingContext} bpmnModel
     * @param {ContainerParsingContext} containerParsingContext
     * @param {WorkflowCodegenContext} workflowCodegenContext
     */
    generateContainerControllerClass(normalizedProcessDef, bpmnModel, containerParsingContext, workflowCodegenContext) {
            const controllerName= `${normalizedProcessDef}Controller`
        nunjucks.configure({
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });

        workflowCodegenContext.containerCodegenContext.openApiCodegen.addPath("/start/process/{processDef}/version/{version}" , "post")
        workflowCodegenContext.containerCodegenContext.openApiCodegen.addPathVariableParameter("/start/process/{processDef}/version/{version}" , "post", 'processDef', 'string')

        workflowCodegenContext.containerCodegenContext.openApiCodegen.addResponse("/start" , "post" , {
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
        workflowCodegenContext.containerCodegenContext.routes.push({verb: "POST", path: "/start/process/:processDef/version/:version" , method: "start"})

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
                startMethod : { name: normalizedProcessDef},
                ProcessDef: normalizedProcessDef,
                containerParsingContext,
                workflowCodegenContext,
            },
        );
        workflowCodegenContext.addControllerClassImport(`${normalizedProcessDef}ProcessInstanceService`,`../services/${normalizedProcessDef.toLowerCase()}.process-instance.service.js`)
        workflowCodegenContext.controllerClassFile = workflowCodegenContext.project.createSourceFile(
            serviceFilePath,
            renderedTemplate,
            {overwrite: true},
        );

    }


}

export default WorkflowBuilder;