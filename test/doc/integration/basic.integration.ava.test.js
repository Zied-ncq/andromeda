import mongoose from "mongoose";
import Utils from "../../src/utils/utils.js";
import EngineService from "../../src/modules/engine/engine.service.js";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {EmbeddedContainerService} from "../../src/modules/engine/embedded/embedded.containers.service.js";
import test from 'ava';
import utils from "../../src/utils/utils.js";


    test.before('database', async () => {
        await mongoose.connect(process.env.MONGODB_URI);
    });


    test.after(async () => {
        await mongoose.disconnect();
    })

    test('Start Embedded container', async (t) => {

        try {
            let wpid = "cov/scenario_script";
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname , ".." ,"resources", "scenario_script.bpmn"  ), {encoding: 'utf8'}));
            /**
             * @type {ContainerParsingContext} containerParsingContext
             */
            let ctx = await Utils.prepareContainerContext(fileContents, wpid);
            ctx.includeGalaxyModule = true;
            ctx.includeWebModule = true;
            ctx.includePersistenceModule = true;

            const engineService = new EngineService();
            await engineService.generateContainer(ctx);
            await EmbeddedContainerService.startEmbeddedContainer(wpid, {port: 10002});
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, 10002);
            t.pass()
        } catch (e) {
            console.error(e)
        }
    })

