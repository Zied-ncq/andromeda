import {AProcess} from "../../../model/domain-model/a-process.js";
import {BpmnTypeConverter} from "./bpmn-type-converter.js";

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
        process.id = root.id
        process.version = version

        const flowElements = root.flowElements;

        const nodes = root.flowElements.filter(e => e.$type !== 'bpmn:SequenceFlow')
        /**
         *
         * @type {SequenceFlow[]}
         */
        const flows = flowElements.filter(e => e.$type === 'bpmn:SequenceFlow')

        process.nodes = []
        process.subProcesses =[]
        for (let node of nodes) {

            if (node.$type === "bpmn:SubProcess") {
                process.subProcesses.push(this.parse(node, version))
            }

            /**
             *
             * @type {ANode}
             */
            const modelNode = {
                id: node.id,
                type: BpmnTypeConverter[node.$type],
            }
            const nodeFlow = flows.filter(e => e.sourceRef.id === node.id)
            modelNode.flows = nodeFlow.map(e => ({
                id: e.id,
                to: e.targetRef.id,
                condition: e.conditionExpression?.body
            }))
            process.nodes.push(modelNode)
        }

        return process;
    }
}