
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
import PersistenceModule from "../src/modules/persistence/persistence.module.js";

// Define sleep function if not already defined
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Logger = AndromedaLogger;



let version = "1.0.0";
const persistenceModule = new PersistenceModule()

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

it('synchronous passing test', async () => {


    const port = 10002
    let wpid = "scenario_script";

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

        await new ContainerClient(port).startProcess("scenario_script", version, port, {})

        await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);

        // expect(true).toBe(true);  // Use global assertion method
    } catch (e) {
        Logger.error(e)
        await EmbeddedContainerService.stopEmbeddedContainer(wpid, version, port);
        throw e;  // Re-throw the error to fail the test
    }
});

it('sub_process', async () => {


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
        await EmbeddedContainerService.stopEmbeddedContainer(wpid, version,  port);


        const processInstancesId = res.id
        const repo = new ProcessInstanceRepository();
        let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
        expect(processInstanceEntity).toBeDefined()
        expect(processInstanceEntity.id).toEqual(processInstancesId)
        expect(processInstanceEntity.wpid).toEqual("sub_process")
        expect(processInstanceEntity.processDef).toEqual("subProcess")
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
