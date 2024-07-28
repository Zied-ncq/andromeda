import {AndromedaLogger} from "../../config/andromeda-logger.js";
import path from "path";
import fs from "fs";
import ContainerCodegenModel from "../../model/codegen/containerCodegenModel.js";
import WorkflowBuilder from "./workflow.builder.js";
import Utils from "../../utils/utils.js";


const Logger = AndromedaLogger;

export class EngineService {


    /**
     * snjk = static njk files, files that are not going to change, like package.json, app.sjs etc..
     * @param dir {string}
     * @param sourcePath {string}
     * @param containerContext {ContainerParsingContext}
     */
    generateStaticFiles(dir, sourcePath, containerContext) {
        let files = fs.readdirSync(dir)
        files.forEach(function (entry) {
            let filePath = path.join(dir, entry)
            if (fs.statSync(filePath).isDirectory()) {
                if (!fs.existsSync(path.join(sourcePath, "/", entry))) {
                    fs.mkdirSync(path.join(sourcePath, "/", entry));
                }
                this.generateStaticFiles(filePath, path.join(sourcePath, entry))
            } else {
                const extension = entry.split('.').pop()
                Logger.debug(`copying static file ${entry}`);
                if (extension === "snjk") {
                    let fileName = entry.split('.').slice(0, -1).join('.');
                    fs.writeFileSync(path.join(sourcePath, fileName), fs.readFileSync(filePath, 'utf-8'));
                }
                if (extension === "js") {
                    fs.writeFileSync(path.join(sourcePath, entry), fs.readFileSync(filePath, 'utf-8'));
                }
            }
        }.bind(this));
    }

    copyModuleIntoContainer(dir, sourcePath) {
        let files = fs.readdirSync(dir)
        files.forEach(function (entry) {
            let filePath = path.join(dir, entry)
            if (fs.statSync(filePath).isDirectory()) {
                if (!fs.existsSync(path.join(sourcePath, "/", entry))) {
                    fs.mkdirSync(path.join(sourcePath, "/", entry));
                }
                this.copyModuleIntoContainer(filePath, path.join(sourcePath, entry))
            } else {
                fs.writeFileSync(path.join(sourcePath, entry), fs.readFileSync(filePath, 'utf-8'));
            }
        }.bind(this));
    }

    /**
     *
     * @param fileContents {string[]}
     * @param wpid {string}
     * @param version {string}
     * @param config {{includeGalaxyModule:boolean,  includeGalaxyModule: boolean,includePersistenceModule: boolean,includeWebModule: boolean,nodeDefinitions: object }}
     * @returns {Promise<void>}
     */
    async generateContainer(fileContents, wpid, version, config) {

        const containerParsingContext = await WorkflowBuilder.prepareBpmnContainerContext(fileContents, wpid, version);
        containerParsingContext.includeGalaxyModule = config.includeGalaxyModule;

        Logger.debug(`Trying to Generate Container`);

        let definitions = EngineService.prepareNodeDefinitions(config);

        const deploymentPath = Utils.getDeploymentPath(containerParsingContext);
        if (!fs.existsSync(deploymentPath)) {
            Logger.debug(`Trying to create deployment folder in path: ${deploymentPath}`);
            fs.mkdirSync(deploymentPath, {recursive: true});
        }

        // if (!containerParsingContext.workflowParsingContext.model || containerParsingContext.model.size === 0) {
        //     Logger.error(`no bpmn model found to generate`);
        //     throw new Error('Cannot generate container, no model found');
        // }
        if(containerParsingContext.includePersistenceModule){
            Logger.info(`Generating module persistence`);
            this.GenerateModule(deploymentPath, "persistence");
        }

        if(containerParsingContext.includeGalaxyModule){
            Logger.info(`Generating module Galaxy`);
            this.GenerateModule(deploymentPath, "galaxy");
        }

        if(containerParsingContext.includeWebModule){
            Logger.info(`Generating module web`);
            this.GenerateModule(deploymentPath, "web");
        }


        const templatePath = path.join(process.cwd(), "src", "modules", "engine", "builder", "templates");
        this.generateStaticFiles(templatePath, deploymentPath , containerParsingContext)

        // common codegen context, contains common things such as routes
        const containerCodegenModel = new ContainerCodegenModel();


        const workflowBuilder = new WorkflowBuilder(containerCodegenModel,definitions)

        for (const process of containerParsingContext.workflowParsingContext) {
            await workflowBuilder.generateWorkflow(process, containerParsingContext, containerCodegenModel);

        }

        this.generateOpenApiYaml(containerParsingContext, containerCodegenModel);

    }

    static prepareNodeDefinitions(config) {
        let filesDefinitions = []
        const directoryPath = path.join(process.cwd(), 'src/modules/engine/builder/processors/definitions');

        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            filesDefinitions.push(JSON.parse(fileContent));
        }

        let definitions = [...(config.nodeDefinitions || []), ...filesDefinitions]
        let defs =  {}
        definitions.forEach( def => {
            defs[def.type] = def
        })
        return defs;
    }

    addLivelinessProbe(containerCodegenContext) {
        containerCodegenContext.openApiCodegen.addPath("/live", "get")
            .addPathDescription("/live", "get", "Liveliness probe (health check)")
            .addPathTags("/live", "get", ["Startup probe"])
            .addResponse("/live", "get", {
                "200": {
                    "description": "Server is alive",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "example": {
                                    "status": "..."
                                }
                            }
                        }
                    }
                }
            })
    }

    addReadinessProbe(containerCodegenContext) {
        containerCodegenContext.openApiCodegen.addPath("/ready", "get")
            .addPathDescription("/ready", "get", "Readiness probe (ready status, after all initialisations)")
            .addPathTags("/ready", "get", ["Startup probe"])
            .addResponse("/ready", "get", {
                "200": {
                    "description": "Server is Ready",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "example": {
                                    "status": "ready"
                                }
                            }
                        }
                    }
                }
            })
    }


    GenerateModule(deploymentPath, moduleName) {
        const persistenceModulePathSource = path.join(process.cwd(), "src", "modules", moduleName);
        const persistenceModulePathDestination = path.join(deploymentPath, "src", "modules");
        if (!fs.existsSync(path.join(deploymentPath,"src"))) {
            fs.mkdirSync(path.join(deploymentPath,"src"));
        }
        if (!fs.existsSync(persistenceModulePathDestination)) {
            fs.mkdirSync(persistenceModulePathDestination);
        }
        if (!fs.existsSync(path.join(persistenceModulePathDestination, moduleName))) {
            fs.mkdirSync(path.join(persistenceModulePathDestination, moduleName));
        }
        this.copyModuleIntoContainer(persistenceModulePathSource, deploymentPath + `/src/modules/${moduleName}`)
    }



    /**
     *
     * @param ctx {ContainerParsingContext}
     * @param containerCodegenContext {ContainerCodegenModel}
     */
    generateOpenApiYaml(ctx, containerCodegenContext) {

        this.addLivelinessProbe(containerCodegenContext);
        this.addReadinessProbe(containerCodegenContext);

        fs.writeFileSync(path.join(Utils.getDeploymentPath(ctx), "specification.yaml"), containerCodegenContext.openApiCodegen.render());
    }

    /**
     * run the container as a node process side by side with the engine --> useful for sandbox mode
     * @returns {Promise<void>}
     */



}

export default EngineService