// External Dependancies
import mongoose from "mongoose";

const processInstanceSchema = new mongoose.Schema({
  title: String,
  brand: String,
  price: String,
  age: Number,
  services: {
    type: Map,
    of: String
  }
})

export const ProcessInstance = mongoose.model('ProcessInstance', processInstanceSchema)
