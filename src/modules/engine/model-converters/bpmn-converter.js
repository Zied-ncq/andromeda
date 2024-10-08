import {AProcess} from "../../../model/domain-model/bzprocess/a-process.js";
import {BpmnTypeConverter} from "./bpmn-type-converter.js";
import {AType} from "../builder/processors/a-node-type.js";

export class BpmnConverter {


    /** @typedef {object} MoodleRoot
     * @property {object} rootElement
     * @property {string} rootElement.$type
     * @property {string} rootElement.id
     * @property {string} rootElement.targetNamespace
     * @property {string} rootElement.exporter
     * @property {string} rootElement.exporterVersion
     * @property {object[]} rootElement.rootElements
     * @property {string} rootElement.rootElements.$type
     * @property {string} rootElement.rootElements.id
     * @property {boolean} rootElement.rootElements.isExecutable
     * @property {object[]} rootElement.rootElements.flowElements
     * @property {string} rootElement.rootElements.flowElements.$type
     * @property {string} rootElement.rootElements.flowElements.id
     * @property {string} rootElement.rootElements.flowElements.name
     * @property {string} rootElement.rootElements.flowElements.script
     */

    /**
     * @param {MoodleRoot} model
     * @param version {string}
     * @returns {AProcess}
     */
    convert(model, version) {

        const definition = model.rootElement;
        const processesInBpmnFile = definition.rootElements.find((e) => e.$type === 'bpmn:Process')

        return this.parse(processesInBpmnFile, version)

    }

    /**
     * @param root {FlowElementsContainer}
     * @param version {string}
     * @returns {AProcess}
     */
    parse(root, version) {
        const process = new AProcess()
        process.hasParentProcess= false;
        process.id = root.id
        process.version = version
        const flowElements = root.flowElements;

        const nodes = root.flowElements.filter(e => e.$type !== 'bpmn:SequenceFlow')
        /**
         *
         * @type {SequenceFlow[]}
         */
        const flows = flowElements.filter(e => e.$type === 'bpmn:SequenceFlow')

        const processVariables = [];
        if (root.properties) {
            root.properties.forEach((p) => {
                // Logger.debug(`add variable ${p.name}`);
                processVariables.push({
                    name: p.name,
                    type: p.itemSubjectRef.structureRef,
                });
            });
            // add meta property to use it when we iterate over variables
        }

        process.variables = processVariables
        process.nodes = []
        process.subProcesses =[]
        for (let node of nodes) {

            if (node.$type === "bpmn:SubProcess") {
                const subProcess = this.parse(node,  version)
                subProcess.hasParentProcess=true;
                process.subProcesses.push(subProcess)
            }

            /**
             *
             * @type {ANode}
             */
            const modelNode = {
                id: node.id,
                type: BpmnTypeConverter[node.$type],
                content: {}
            }

            if (node.$type === "bpmn:ScriptTask" && node.script !== undefined) {
                modelNode.content.script = node.script
            }

            if (node.$type === "bpmn:IntermediateCatchEvent") {
                if(node.eventDefinitions){
                    const signal =node.eventDefinitions[0]
                    if(signal){
                        modelNode.signal = {
                            id: signal.signalRef.id,
                            name: signal.signalRef.name
                        }
                    }
                }
            }


            const nodeFlow = flows.filter(e => e.sourceRef.id === node.id)
            modelNode.flows = nodeFlow.map(e => ({
                id: e.id,
                to: {
                    id: e.targetRef.id,
                    type: BpmnTypeConverter[e.targetRef?.$type],
                },
                from: {
                    id: e.sourceRef.id,
                    type: BpmnTypeConverter[e.sourceRef.$type] ,
                },

                condition: e.conditionExpression?.body
            }));

            process.nodes.push(modelNode)
        }
        // fill refs

        // for (let node of process.nodes) {
        //     for (let flow of node.flows) {
        //         flow.to.ref = process.nodes.find(e=> e.id === flow.to.id)
        //         // flow.from = {
        //         //     ref: node,
        //         //     id :node.id
        //         // }
        //     }
        // }


        return process;
    }
}