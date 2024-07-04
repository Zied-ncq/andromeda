/**
 * Model used for bpmn parsing
 */
export class WorkflowParsingContext {

    /**
     * @property {AProcess} model
     * @public
     */
    model;

    processPrefix;

    constructor(config) {
        this.model = config && config.model;
        this.processPrefix = config && config.processPrefix;
    }
}

