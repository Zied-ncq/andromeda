import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

import mongoose from "mongoose";
import {EmbeddedContainerService} from "./embedded.containers.service.js";
import * as net from "net";
import {Config} from "../../../config/config.js";
import Utils from "../../../utils/utils.js";
import {EmbeddedLauncher} from "./embedded-launcher.js";
import AndromedaLogger from "../../../config/andromeda-logger.js";

const Logger = AndromedaLogger;


// sum.test.js
import { expect, test } from 'vitest'

test('adds 1 + 2 to equal 3', async () => {
    const deploymentPath = path.join(Config.getInstance().deploymentPath, 'launch_spawn')

    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath);
    }

    fs.writeFileSync(path.join(deploymentPath, 'launch_spawn.js'), "console.log('www')")

    let childProcess;
    let executor = '';
    let args = []

    executor = path.join(deploymentPath, "/launch_spawn.js")
    try {
        const embeddedLauncher = new EmbeddedLauncher();
        childProcess = await embeddedLauncher.start(executor, {
            max: 1,
            silent: false,
            killTree: true,
            env: {
                HTTP_PORT: String(20000),
                DB_URI: Config.getInstance().dbURI,
                wpid: 'wpid'
            },
            mode: 'spawn',
            cwd: deploymentPath,
            args: args
        });
        if (!childProcess || !childProcess.pid) {
            throw new Error(`cannot start child process`);
        }

    } catch (e) {
        Logger.error(e)
        throw e;
    }
})

// describe('Embedded launcher', ()=>{

//
//     test('launch fork process', async () => {
//
//         const deploymentPath = path.join(Config.getInstance().deploymentPath, 'launch_fork')
//         if (!fs.existsSync(deploymentPath)) {
//             fs.mkdirSync(deploymentPath);
//         }
//
//         fs.writeFileSync(path.join(deploymentPath, 'launch_fork.js'), "console.log('www')")
//
//         let childProcess;
//         let executor = '';
//         let args = []
//
//         executor = path.join(deploymentPath, "/launch_fork.js")
//         try {
//             const embeddedLauncher = new EmbeddedLauncher();
//             childProcess = await embeddedLauncher.start(executor, {
//                 max: 1,
//                 silent: false,
//                 killTree: true,
//                 env: {
//                     HTTP_PORT: String(20000),
//                     DB_URI: Config.getInstance().dbURI,
//                     wpid: 'wpid'
//                 },
//                 mode: 'fork',
//                 cwd: deploymentPath,
//                 args: args
//             });
//             if (!childProcess || !childProcess.pid) {
//                 throw new Error(`cannot start child process`);
//             }
//
//         } catch (e) {
//             Logger.error(e)
//             throw e;
//         }
//
//     })
//
// })

