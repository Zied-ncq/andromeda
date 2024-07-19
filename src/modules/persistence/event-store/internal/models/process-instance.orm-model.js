
import mongoose from "mongoose";

export const ProcessInstanceStatus = {
    Active: 0,
    Completed: 1,
    Error: 2,
    Aborted: 3
};

const Lock = new mongoose.Schema({
    containerId      : String,
    date      : Date
});
const processInstanceSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: crypto.randomUUID()
    },

    wpid: {
        type: String,
        required: true
    },
    version:  {
        type: String,
        required: true
    },
    status: {
        type: Number,
        enum: [ProcessInstanceStatus.Active, ProcessInstanceStatus.Completed, ProcessInstanceStatus.Error, ProcessInstanceStatus.Aborted ],
        required: true,
        default: 0
    },
    lock: {
        type: Lock
    }
})

const ProcessInstanceModel = mongoose.model('ProcessInstance', processInstanceSchema , 'ProcessInstance' )

export default ProcessInstanceModel;