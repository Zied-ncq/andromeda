
import mongoose from "mongoose";


const TaskSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: crypto.randomUUID()
    },
    processInstanceId: {
        type: String,
        ref: 'ProcessInstance',
        required: true,
        createIndexes: true
    },
    signalId: {
        type: String,
        required: false,
        createIndexes: true
    },
    type:{
        type: String,
        required: true,
        createIndexes: true
    },
    status:{
        type: Number,
        required: true,
        createIndexes: true
    }
});

const TaskModel = mongoose.model('Task', TaskSchema , 'Task' )

export default TaskModel;