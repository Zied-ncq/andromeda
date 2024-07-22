
import { fileURLToPath } from 'url';
import path, {join} from 'path';
import fs from 'fs';
import Utils from '../src/utils/utils.js';
import EngineService from '../src/modules/engine/engine.service.js';
import { EmbeddedContainerService } from '../src/modules/engine/embedded/embedded.containers.service.js';
import {ContainerClient} from "../src/utils/ContainerClient.js";
import {AndromedaLogger} from "../src/config/andromeda-logger.js";
import {Config} from "../src/config/config.js";
import {
    ProcessInstanceRepository
} from "../src/modules/persistence/event-store/repositories/process-instance.repository.js";
import {PersistenceModule} from "../src/modules/persistence/persistence.module.js";

// Define sleep function if not already defined
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Logger = AndromedaLogger;
import { expect, test , beforeAll, afterAll, describe } from 'vitest'


let version = "1.0.0";
const persistenceModule = new PersistenceModule()

describe('Engine tests', ()=>{


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
                includePersistenceModule : true
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            await new ContainerClient(port).startProcess("basic_scenario", version, port, {})

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
                includePersistenceModule : true
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(port);
            const res = await containerClient.startProcess("subProcess", version, port, {})
            const processInstancesId = res.id
            await ContainerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId, port)
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
                includePersistenceModule : true
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(port);
            const res = await containerClient.startProcess("subSubProcess", version, port, {})

            const processInstancesId = res.id
            await ContainerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId, port)

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
                includePersistenceModule : true
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });
            const containerClient = new ContainerClient(port);
            const res = await containerClient.startProcess("variables", version, port, {
                age: 5,
                ddd : "string",
                content: {   c: 5,
                    d : "string"
                }
            })
            const processInstancesId = res.id
            await ContainerClient.waitForProcessInstanceToCompleteProcessing(processInstancesId, port)

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
                includePersistenceModule : true
            });
            await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

            const containerClient = new ContainerClient(port);
            const res = await containerClient.startProcess("catchEvent", version, port, {})
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);


            await sleep(500)
            const processInstancesId = res.id
            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("catch_event")
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

})