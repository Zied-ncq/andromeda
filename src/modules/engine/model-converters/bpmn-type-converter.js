import {AType} from "../builder/processors/a-node-type.js";

export const BpmnTypeConverter = {
    "bpmn:ScriptTask" : AType.ScriptTask,
    "bpmn:StartEvent" : AType.StartEvent,
    "bpmn:EndEvent" : AType.EndEvent,
    "bpmn:SubProcess" : AType.SubProcess,
    "bpmn:IntermediateCatchEvent" : AType.CatchEvent,
}