
import { fileURLToPath } from 'url';
import path, {join} from 'path';
import fs from 'fs';
import Utils from '../src/utils/utils.js';
import EngineService from '../src/modules/engine/engine.service.js';
import { EmbeddedContainerService } from '../src/modules/engine/embedded/embedded.containers.service.js';
import { config as LoadDotEnvConfig } from 'dotenv';
import {ContainerClient} from "../src/utils/ContainerClient.js";
import {AndromedaLogger} from "../src/config/andromeda-logger.js";

// Define sleep function if not already defined
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Logger = new AndromedaLogger("TEST");


it('synchronous passing test', async () => {

    let deploymentId = "cov/scenario_script";
    const port = 10002

    try {

        let fileContents = [];
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        fileContents.push(fs.readFileSync(path.join(__dirname, "resources", "scenario_script.bpmn"), { encoding: 'utf8' }));

        let ctx = await Utils.prepareContainerContext(fileContents, deploymentId);
        ctx.includeGalaxyModule = true;
        ctx.includeWebModule = true;
        ctx.includePersistenceModule = true;



        const engineService = new EngineService();
        await engineService.generateContainer(ctx);
        await EmbeddedContainerService.startEmbeddedContainer(deploymentId, { HTTP_PORT: port });

        await new ContainerClient(port).startProcess("", port, {})

        await sleep(2000);

        await EmbeddedContainerService.stopEmbeddedContainer(deploymentId, port);

        // expect(true).toBe(true);  // Use global assertion method
    } catch (e) {
        Logger.error(e)
        await EmbeddedContainerService.stopEmbeddedContainer(deploymentId, port);
        throw e;  // Re-throw the error to fail the test
    }
});
