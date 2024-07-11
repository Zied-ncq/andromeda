import path from "path";
import ipc from "node-ipc";
import { AndromedaLogger } from "../../../config/andromeda-logger.js";

const Logger = AndromedaLogger;

/**
 * NB: THIS HELPER IS USED ONLY LOCALLY IN DEV MODE
 * A helper to kill child (containers aka node process) using a separate daemon when the engine is closed
 * When the daemon detects that the engine is closed, checks pid regularly, it will close all related note processes.
 * When the engine starts, it will start the daemon, and sends its own pid.
 * When a container starts, it will send the pid of the created process, the daemon will store it in memory.
 */
export class EmbeddedSidecarDaemonService {
    static socketPath = path.join(process.cwd(), '/temp/andromeda.ipc.sock');

    static initDaemon() {
        ipc.config.id = 'andromeda_engine';
        ipc.config.retry = 5000;
        ipc.config.stopRetrying = true;

        /**
         * @role: using node ipc (inter process call) we start the another process called sidecar daemon
         */
        function initEngine() {
            ipc.of.andromeda_daemon.on('connect', function () {
                ipc.of.andromeda_daemon.emit('watch_engine_pid', {
                    message: process.pid
                });
                ipc.disconnect('andromeda_engine');
            });
        }
        // here we spawn the sidecar
        import('child_process').then(childProcess => {
            const child = childProcess.spawn('node', ['./dev-engine-sidecar.daemon.js'], {
                detached: true
            });
            child.stdout.on('data', data => {
                console.log(`${data}`);
            });
            child.stderr.on('data', data => {
                console.log(`${data}`);
            });
        });

        setTimeout(() => {
            // socker path = /temp/andromeda.ipc.sock
            ipc.connectTo('andromeda_daemon', EmbeddedSidecarDaemonService.socketPath, initEngine);
        }, 2000);
    }

    static watchContainer(pid) {
        try {
            if (!ipc.of.andromeda_daemon) {
                throw new Error('IPC connection to andromeda_daemon is not established.');
            }
            ipc.of.andromeda_daemon.emit('watch_container_pid', {
                message: pid
            });
        } catch (e) {
            Logger.warn(e);
        }
    }

    static unwatchContainerPid(pid) {
        try {
            if (!ipc.of.andromeda_daemon) {
                throw new Error('IPC connection to andromeda_daemon is not established.');
            }
            ipc.of.andromeda_daemon.emit('unwatch_container_pid', {
                message: pid
            });
        } catch (e) {
            Logger.warn(e);
        }
    }

    static shutdownDaemon() {
        try {
            if (!ipc.of.andromeda_daemon) {
                throw new Error('IPC connection to andromeda_daemon is not established.');
            }
            Logger.warn(`Signal to shutdown the daemon was received`);
            ipc.of.andromeda_daemon.emit('shutdown', {});
        } catch (e) {
            Logger.warn(e);
        }
    }
}