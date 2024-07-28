
import mongoose from "mongoose";


const TaskSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: crypto.randomUUID()
    },
    processInstance: {
        type: String,
        ref: 'ProcessInstance',
        required: true,
        createIndexes: true
    },
    signalName: {
        type: String,
        required: false,
        createIndexes: true
    },
    type:{
        type: String,
        required: true,
        createIndexes: true
    }
});

const TaskModel = mongoose.model('Task', TaskSchema , 'Task' )

export default TaskModel;