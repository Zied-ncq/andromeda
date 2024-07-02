import mongoose from "mongoose";
import Utils from "../../src/utils/utils.js";
import EngineService from "../../src/modules/engine/engine.service.js";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {EmbeddedContainerService} from "../../src/modules/engine/embedded/embedded.containers.service.js";
import test from 'ava';


    test.before(async () => {

        await mongoose.connect(process.env.MONGODB_URI);
    });

    test.after(async () => {
        await mongoose.disconnect();
    })

    test('Start/Stop Embedded container', async (t) => {
            let wpid = "test";
            let fileContents = [];
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fileContents.push(fs.readFileSync(path.join(__dirname, ".." ,"resources", "andromeda.bpmn"  ), {encoding: 'utf8'}));

            let ctx = await Utils.prepareContainerContext(fileContents, wpid);
            const engineService = new EngineService();
            await engineService.generateContainer(ctx);
            await EmbeddedContainerService.startEmbeddedContainer(wpid, {port:10000});
            await EmbeddedContainerService.stopEmbeddedContainer(wpid, 10000);

    });
