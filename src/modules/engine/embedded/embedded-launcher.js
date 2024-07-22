import * as fs from 'fs';
import { fork, spawn, exec } from 'child_process';
import { AndromedaLogger } from "../../../config/andromeda-logger.js";

const Logger = AndromedaLogger;

export class EmbeddedLauncher {
    constructor() {
        this.currentRestarts = 0;
        this.childProcess = null;
    }

    /**
     * @role: execute a generated js file
     * Starts the executor with the given options.
     * @param {string} executor - The command to execute (e.g., 'node').
     * @param {Object} options - The options for execution.
     * @param {number} [options.max=Infinity] - Maximum number of restarts allowed.
     * @param {boolean} [options.silent=false] - If true, suppress output logging.
     * @param {boolean} [options.killTree=false] - If true, kills the entire process tree on stop.
     * @param {Object} [options.env=process.env] - Environment variables to set for the process.
     * @param {string} [options.cwd=process.cwd()] - Current working directory for the process.
     * @param {string} [options.mode='fork'] - child process mode, fork | spawn.
     * @param {Array<string>} [options.args=[]] - Arguments to pass to the command.
     * @param {string} [options.logFile='embedded-launcher.log'] - Path to the log file.
     */
    start(executor, options = {}) {
        const maxRestarts = options.max || Infinity;
        const silent = options.silent || false;
        const killTree = options.killTree || false;
        const env = options.env || process.env;
        const cwd = options.cwd || process.cwd();
        const args = options.args || [];
        const logFile = options.logFile || 'embedded-launcher.log';

        if (this.currentRestarts >= maxRestarts) {
            this.log('Maximum restarts reached. Exiting.', logFile, silent);
            return;
        }

        const executorOptions = {
            env: env,
            cwd: cwd,
            stdio: 'inherit', // Inherit stdio from the parent process
            stderr: 'inherit'
        }

        if (options.mode === 'spawn') {
            let executorArgs = [executor, ...args]
            if(process.env.PROFILE === 'test'){
                executorArgs = [
                    // '--inspect',
                    executor
                    , ...args
                ]
            }
            this.childProcess = spawn('node', executorArgs, executorOptions);
        } else {
            this.childProcess = fork(executor, args, executorOptions);

        }

        this.childProcess.on('close', (code) => {
            this.log(`Process exited with code ${code}`, logFile, silent);
            this.currentRestarts += 1;
            this.log(`Restarting process (${this.currentRestarts}/${maxRestarts})...`, logFile, silent);
            setTimeout(() => this.start(executor, options), 1000); // Restart after 1 second
        });

        return this.childProcess;
    }

    /**
     * Logs a message to the specified log file.
     * @param {string} message - The message to log.
     * @param {string} logFile - The path to the log file.
     * @param {boolean} silent - If true, suppress output logging.
     */
    log(message, logFile, silent) {
        if (!silent) {
            const timestamp = new Date().toISOString();
            const logMessage = `${timestamp} - ${message}\n`;
            fs.appendFileSync(logFile, logMessage);
        }
    }

    /**
     * Stops the running process.
     * @param {boolean} killTree - If true, kills the entire process tree.
     * @param {string} logFile - The path to the log file.
     * @param {boolean} silent - If true, suppress output logging.
     */
    stop(killTree, logFile, silent) {
        if (this.childProcess) {
            if (killTree) {
                this.killProcessTree(this.childProcess.pid, logFile, silent);
            } else {
                this.childProcess.kill();
            }
        }
    }

    /**
     * Kills the process tree of the given PID.
     * @param {number} pid - The process ID.
     */
    killProcessTree(pid) {
        const isWindows = process.platform === 'win32';

        if (isWindows) {
            // Windows
            exec(`taskkill /PID ${pid} /T /F`, (err, stdout, stderr) => {
                if (err) {
                    Logger.error(`Error killing process tree: ${err.message}`);
                } else {
                    Logger.info(`Process tree with PID ${pid} killed`);
                }
            });
        } else {
            // Unix-like
            exec(`pkill -TERM -P ${pid}`, (err, stdout, stderr) => {
                if (err) {
                    Logger.error(`Error killing process tree: ${err.message}`);
                } else {
                    Logger.info(`Process tree with PID ${pid} killed`);
                }
            });
        }
    }
}
