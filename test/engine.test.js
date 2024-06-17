
import { fileURLToPath } from 'url';
import path, {join} from 'path';
import fs from 'fs';
import Utils from '../src/utils/utils.js';
import EngineService from '../src/modules/engine/engine.service.js';
import { EmbeddedContainerService } from '../src/modules/engine/embedded/embedded.containers.service.js';
import { config as LoadDotEnvConfig } from 'dotenv';

// Define sleep function if not already defined
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



it('synchronous passing test', async () => {
    try {
        let deploymentId = "cov/scenario_script";
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
        await EmbeddedContainerService.startEmbeddedContainer(deploymentId, { port: 10002 });
        await sleep(2000);
        await EmbeddedContainerService.stopEmbeddedContainer(deploymentId, 10002);

        // expect(true).toBe(true);  // Use global assertion method
    } catch (e) {
        console.error(e);
        throw e;  // Re-throw the error to fail the test
    }
});
