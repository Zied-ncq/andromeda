
import { fileURLToPath } from 'url';
import path, {join} from 'path';
import fs from 'fs';
import Utils from '../src/utils/utils.js';
import EngineService from '../src/modules/engine/engine.service.js';
import { EmbeddedContainerService } from '../src/modules/engine/embedded/embedded.containers.service.js';
import {ContainerClient} from "../src/utils/ContainerClient.js";
import {AndromedaLogger} from "../src/config/andromeda-logger.js";

// Define sleep function if not already defined
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Logger = new AndromedaLogger("TEST");


it('synchronous passing test', async () => {

    let wpid = "scenario_script";

    let version = "1.0.0";
    const port = 10002

    function getBpmnTestFile(fileName) {
        let fileContents = [];
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        fileContents.push(fs.readFileSync(path.join(__dirname, "resources", fileName), {encoding: 'utf8'}));
        return fileContents;
    }

    try {
        let fileContents = getBpmnTestFile("scenario_script.bpmn");

        let ctx = await Utils.prepareContainerContext(fileContents, wpid, version);
        ctx.includeGalaxyModule = true;
        ctx.includeWebModule = true;
        ctx.includePersistenceModule = true;



        const engineService = new EngineService();
        await engineService.generateContainer(ctx);
        await EmbeddedContainerService.startEmbeddedContainer(wpid, version, { HTTP_PORT: port });

        await new ContainerClient(port).startProcess("scenario_script", version, port, {})

        await sleep(2000);

        await EmbeddedContainerService.stopEmbeddedContainer(wpid, port);

        // expect(true).toBe(true);  // Use global assertion method
    } catch (e) {
        Logger.error(e)
        await EmbeddedContainerService.stopEmbeddedContainer(wpid, port);
        throw e;  // Re-throw the error to fail the test
    }
});
