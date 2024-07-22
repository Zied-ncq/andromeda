
import mongoose from "mongoose";


const SequenceFlowSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: crypto.randomUUID()
    },
    flowId: {
        type: String,
        required: true,
    },
    to: {
        type: Object,
        required: true,
    },
    nodeSession: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    executable: {
        type: Boolean,
        required: true,
    },
    processInstanceId: {
        type: String,
        ref: 'ProcessInstance',
        required: true,
    },
});

const SequenceFlowModel = mongoose.model('SequenceFlow', SequenceFlowSchema , 'SequenceFlow' )

export default SequenceFlowModel;