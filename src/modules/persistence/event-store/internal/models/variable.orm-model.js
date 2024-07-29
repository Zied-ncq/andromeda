
import mongoose from "mongoose";


const VariableSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: crypto.randomUUID()
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    wpid: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    processInstanceId: {
        type: String,
        ref: 'ProcessInstance',
        required: true,
    },
});

const VariableModel = mongoose.model('Variable', VariableSchema , 'Variable' )

export default VariableModel;