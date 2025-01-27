
import { fileURLToPath } from 'url';
import path, {join} from 'path';
import fs from 'fs';
import EngineService from '../src/modules/engine/engine.service.js';
import { EmbeddedContainerService } from '../src/modules/engine/embedded/embedded.containers.service.js';
import {ContainerClient} from "../src/utils/ContainerClient.js";
import {AndromedaLogger} from "../src/config/andromeda-logger.js";
import {Config} from "../src/config/config.js";
import {
    ProcessInstanceRepository
} from "../src/modules/persistence/event-store/repositories/process-instance.repository.js";
import {
    VariableRepository
} from "../src/modules/persistence/event-store/repositories/variable.repository.js";
import {PersistenceModule} from "../src/modules/persistence/persistence.module.js";

// Define sleep function if not already defined
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Logger = AndromedaLogger;
import { expect, test , beforeAll, afterAll, describe } from 'vitest'
import {SequenceFlowRepository} from "../src/modules/persistence/event-store/repositories/sequence-flow.repository.js";


let version = "1.0.0";
let host = "127.0.0.1";

const persistenceModule = new PersistenceModule()

describe.concurrent('Engine tests', ()=>{


    beforeAll(async () => {

        await persistenceModule.start();

        const cleanProcessWpids = ["scenario_script"];
        for (let wpid of cleanProcessWpids) {
            const deploymentPath = path.join(Config.getInstance().deploymentPath, wpid, version);
            if (fs.existsSync(deploymentPath)) {
                fs.rmdirSync(deploymentPath, {recursive: true})

            }
        }
    })

    afterAll(async () => {
        await persistenceModule.dispose();
    })

    test('synchronous passing test', async () => {


        const port = 10002
        const host = '127.0.0.1'
        let wpid = "basic_scenario";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("scenario_script.bpmn");

            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            await new ContainerClient(host, port).startProcess("Basic_scenario", version, {})

            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);

            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });

    test('sub_process', async () => {


        const port = 10003
        let wpid = "sub_process";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("sub_process.bpmn");

            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(host, port);
            const res = await containerClient.startProcess("SubProcess", version, {})
            const processInstancesId = res.id
            await containerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);


            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("sub_process")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(1)
            expect(processInstanceEntity.lock).toBeNull()

            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });


    test('sub_sub_process', async () => {


        const port = 10004
        let wpid = "sub_sub_process";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("sub_sub_process.bpmn");

            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(host, port);
            const res = await containerClient.startProcess("SubSubProcess", version, {
                age: 5,
                ddd : "string",
                content: {   c: 5,
                    d : "string"
                }
            })

            const processInstancesId = res.id
            await new ContainerClient(host, port).waitForProcessInstanceToCompleteProcessing(processInstancesId)

            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);

            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("sub_sub_process")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(1)
            expect(processInstanceEntity.lock).toBeNull()

            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });

    test('variables', async () => {


        const port = 10005
        let wpid = "variables";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("variables.bpmn");

            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });
            const containerClient = new ContainerClient(host, port);
            const res = await containerClient.startProcess("Variables", version, {
                age: 5,
                ddd : "string",
                content: {   c: 5,
                    d : "string"
                }
            })
            const processInstancesId = res.id
            await new ContainerClient(host, port).waitForProcessInstanceToCompleteProcessing(processInstancesId)

            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);



            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity).not.toBeNull()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("variables")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(1)
            expect(processInstanceEntity.lock).toBeNull()

            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });

    test('catch_event', async () => {


        const port = 10006
        let wpid = "catch_event";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("catch_event.bpmn");

            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(host, port);
            const res = await containerClient.startProcess("CatchEvent", version, {
                age: 5
            })

            const processInstancesId = res.id

            await containerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId)



            const processInstanceRepository = new ProcessInstanceRepository();
            const varRepository = new VariableRepository();
            let processInstanceEntity = await processInstanceRepository.getProcessInstanceById(processInstancesId)
            let ageVar = await varRepository.getProcessInstanceVariableByName(processInstanceEntity.id, 'age')
            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("catch_event")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(0)
            expect(processInstanceEntity.lock).toBeNull()
            expect(ageVar.value).toEqual(5)


            await containerClient.callCatchEvent(processInstancesId, 'CATCH_EVENT', {
                age: 17
            })

            await containerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId)

            let processInstanceEntity2 = await processInstanceRepository.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity2).toBeDefined()
            expect(processInstanceEntity2.id).toEqual(processInstancesId)
            expect(processInstanceEntity2.wpid).toEqual("catch_event")
            expect(processInstanceEntity2.version).toEqual("1.0.0")
            expect(processInstanceEntity2.status).toEqual(1)
            expect(processInstanceEntity2.lock).toBeNull()

            ageVar = await varRepository.getProcessInstanceVariableByName(processInstanceEntity.id, 'age')
            expect(ageVar.value).toEqual(17)

            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);
            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });

    test('conditional_flow', async () => {


        const port = 10007
        let wpid = "conditional_flow";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("conditional_flow.bpmn");

            const processInstanceRepository = new ProcessInstanceRepository();
            const varRepository = new VariableRepository();


            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(host, port);

            let res = await containerClient.startProcess("Conditional_flow", version, {
                age: 10
            })
            const process1InstancesId = res.id
            await containerClient.waitForProcessInstanceToCompleteProcessing(process1InstancesId)
            let processInstanceEntity = await processInstanceRepository.getProcessInstanceById(process1InstancesId)
            let ageVar = await varRepository.getProcessInstanceVariableByName(processInstanceEntity.id, 'age')
            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(process1InstancesId)
            expect(processInstanceEntity.wpid).toEqual("conditional_flow")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(0)
            expect(processInstanceEntity.lock).toBeNull()
            //expect(ageVar.value).toEqual(26)

            res = await containerClient.startProcess("Conditional_flow", version, {
                age: 12
            });
            const process2InstancesId = res.id
            await containerClient.waitForProcessInstanceToCompleteProcessing(process2InstancesId)
            let processInstance2 = await processInstanceRepository.getProcessInstanceById(process2InstancesId)
            expect(processInstance2.status).toEqual(1)

            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);
            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });

    test('exclusive gateway should fail when no path is executed', async () => {


        const port = 10008
        let wpid = "exclusive_gateway_with_error";

        function getBpmnTestFile(fileName) {
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
            return fileContents;
        }

        try {
            let fileContents = getBpmnTestFile("exclusive_gateway_with_error.bpmn");

            const engineService = new EngineService();
            await engineService.generateContainer(fileContents, wpid, version, {
                includeGalaxyModule : true,
                includeWebModule : true,
                includePersistenceModule : true,
                nodeDefinitions: []
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(host, port);
            const res = await containerClient.startProcess("Exclusive_gateway_with_error", version, {
                age: 25
            })

            const processInstancesId = res.id

            await containerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId)



            const processInstanceRepository = new ProcessInstanceRepository();
            const varRepository = new VariableRepository();
            let processInstanceEntity = await processInstanceRepository.getProcessInstanceById(processInstancesId)
            let ageVar = await varRepository.getProcessInstanceVariableByName(processInstanceEntity.id, 'age')
            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("exclusive_gateway_with_error")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(2)
            expect(processInstanceEntity.lock).toBeNull()
            expect(ageVar.value).toEqual(25)

            const sequenceFlowRepository = new SequenceFlowRepository();
            const flow0 =  await sequenceFlowRepository.getSequenceFlowById('flow_0', processInstancesId)
            expect(flow0).not.toBeNull()
            expect(flow0).toBeDefined()
            expect(flow0.status).toEqual(2)



            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);
            // expect(true).toBe(true);  // Use global assertion method
        } catch (e) {
            Logger.error(e)
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
            throw e;  // Re-throw the error to fail the test
        }
    });

})