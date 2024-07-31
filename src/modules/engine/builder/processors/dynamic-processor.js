import {AndromedaLogger} from "../../../../config/andromeda-logger.js";
import {ProcessHelper} from "./process-helper.js";

const Logger = AndromedaLogger;

/**
 * @typedef {Object} WebControllerConfig
 * @property {boolean} enabled - Indicates if the web controller is enabled.
 * @property {Object} config - Configuration for the web controller.
 * @property {string} config.path - The URL path for the controller.
 * @property {string} config.verb - The HTTP verb to use (e.g., "post").
 * @property {string} config.methodName - The name of the method to call (if any).
 * @property {boolean} config.secure - Indicates if the endpoint is secure.
 * @property {string[]} config.secure_roles - The roles allowed to access the endpoint.
 */

/**
 * @typedef {Object} Body
 * @property {string} mode - The mode of the body content (e.g., "eval", "static").
 * @property {string} content - The content of the body.
 */

/**
 * @typedef {Object} Flow
 * @property {string} mode - The mode of the flow (e.g., "simple").
 * @property {number} status - The status of the flow.
 * @property {string} suffix - The suffix to use for the flow.
 */

/**
 * @typedef {Object} Node
 * @property {WebControllerConfig} [webController] - Configuration for the web controller (optional).
 * @property {string} nameSuffix - suffix for the function name, used for two phase components (e.g. catch event) .
 * @property {Body} body - Configuration for the body content.
 * @property {Flow} flow - Configuration for the flow.
 */

/**
 * @typedef {Object} Import
 * @property {string} name - The name of the import.
 * @property {string} version - The version of the import.
 */

/**
 * @typedef {Object} DefinitionConfig
 * @property {string} type - The type of the event (e.g., "IntermediateCatchEvent").
 * @property {Node[]} nodes - The nodes in the event.
 * @property {Import[]} imports - The imports for the event.
 */

class DynamicProcessor {

    type

    /**
     * @property config
     * @type {DefinitionConfig}
     */
    config

    /**
     * @param config {DefinitionConfig}
     */
    constructor(config) {
        this.type = config.type
        this.config = config
    }


    process(currentNode, workflowCodegenContext, containerParsingContext, process){

        Logger.info(`processing ${this.type} Node from Dynamic Processor`);

        let nodeContexts = []
        let vars = DynamicProcessor.getVaras(this.config, currentNode);

        const wpid = containerParsingContext.wpid
        const cnwpid = ProcessHelper.upperFirstChar(ProcessHelper.snakeToCamel(wpid))

        this.config.nodes.forEach(node => {
            let body = DynamicProcessor.getBody(node, currentNode, vars);

            let nodeRes ={
                id: currentNode.id,
                type: this.type,
                name: currentNode.name || currentNode.id,
                body,
            }

            if(node.stopAfterFirstCallToTreatWebhooksLikeNodes !== undefined && node.stopAfterFirstCallToTreatWebhooksLikeNodes){
                nodeRes.stopAfterFirstCallToTreatWebhooksLikeNodes = true
            }else{
                nodeRes.stopAfterFirstCallToTreatWebhooksLikeNodes = false
            }

            if(node.nameSuffix ){
                nodeRes.name+=node.nameSuffix
            }

            if(node.flow){
                    nodeRes.flow = {}
                    nodeRes.flow.mode = node.flow.mode;
                    nodeRes.flow.status = node.flow.status;
                    nodeRes.flow.suffix = node.flow.suffix;
            }
            /**

             */

            if(node.http && node.http.enabled === true){
                workflowCodegenContext.controllerClassFile.getClass("")
                workflowCodegenContext.controllerClass.addMember(`static async ${currentNode.id}(req, res){
                try {
                        const processInstanceId = req.params.process_id;
                        const signalName = '${vars.signalId}';
                        let processInstanceService;
                        
                        if (ContainerService.processInstances.has(processInstanceId)) {
                          processInstanceService = ContainerService.processInstances.get(processInstanceId);
                          Logger.info(\`Resume existing process instance :\${processInstanceService.__metaInfo.processInstanceId} from ${currentNode.type} node\` );
                        } else {
                          processInstanceService =await ${cnwpid}ProcessInstanceService.createInstance(processInstanceId);
                          Logger.info(\`creating a new process instance :\${processInstanceService.__metaInfo.processInstanceId} to resume activity\`);
                        }
                        
                        // async call
                        processInstanceService.fn_${currentNode.id}${node.nameSuffix}()
                    } catch (error) {
                        Logger.error(error);
                        await this.__metaInfo.workflowHelper.failProcessInstance('_start_${currentNode.id}');
                    }
            }`);

                const template = "`"+node.http.path+"`";
                const path = eval(template)

                workflowCodegenContext.containerCodegenModel.routes.push({verb: node.http.type, path , method: currentNode.id})
                workflowCodegenContext.containerCodegenModel.openApiCodegen.addPath(path , "post")
                workflowCodegenContext.containerCodegenModel.openApiCodegen.addPathVariableParameter(path , "post", 'process_id', 'string')
                workflowCodegenContext.containerCodegenModel.openApiCodegen.addResponse(path , "post" , {
                    "responses": {
                        "200": {
                            "description": "Process instance id"
                        },
                    }
                })


            }
            // workflowCodegenContext.addControllerClassImport(`${cnwpid}ProcessInstanceService`)

            nodeContexts.push(nodeRes);

        })

        return nodeContexts;

    }

    static getVaras(node, currentNode) {
        let vars = {}

        if (node.vars !== undefined) {
            Object.keys(node.vars).forEach(v => {
                vars[v] = eval(node.vars[v]);
            })
        }
        return vars;
    }

    static getBody(node, currentNode,vars) {
        let body = ''

        body += `let vars = ${JSON.stringify(vars)};`;

        if (node.body.mode === 'static') {
            body += node.body.content
        }

        if (node.body.mode === 'eval') {
            body += eval(node.body.content)
        }
        return body;
    }
}

export default DynamicProcessor;