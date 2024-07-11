import {EventStore} from "./event-store.js";
import PersistenceModule from "../persistence.module.js";
import mongoose from "mongoose";
import {StreamIds} from "./streams/stream-ids.js";
import {ProcessInstanceRepository} from "./repositories/process-instance.repository.js";


const persistenceModule = new PersistenceModule()

const sleep = function (ms) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
    });
};


describe('Event Store', () => {

    beforeAll(async () => {
        process.env.PROFILE = 'integration'
        await persistenceModule.start();
    })

    afterAll(async () => {
        await persistenceModule.dispose()
    })

    it('Inert event',
        /**
         *
         * @param {Assertions}t
         * @returns {Promise<void>}
         */
        async () => {

            await EventStore.apply({
                id: crypto.randomUUID(),
                streamId: "PROCESS_INSTANCE",
                type: "CREATE_PROCESS_INSTANCE",
                streamPosition: 0,
                data: {
                    id: crypto.randomUUID(),
                    wpid: "wpid",
                    processDef: "processDef",
                    version: '1.0.0',
                    status: 0,
                    containerId: crypto.randomUUID()
                },
                timestamp: new Date().toString()
            });

            await EventStore.apply({
                id: crypto.randomUUID(),
                streamId: "PROCESS_INSTANCE",
                type: "CREATE_PROCESS_INSTANCE",
                streamPosition: 0,
                data: {
                    id: crypto.randomUUID(),
                    wpid: "wpid",
                    processDef: "processDef",
                    status: 0,
                    version: '1.0.0',
                    containerId: crypto.randomUUID()
                },
                timestamp: new Date().toString()
            });

        })

    it('Create/Close process instance',
        /**
         *
         * @param {Assertions}t
         * @returns {Promise<void>}
         */
        async () => {
            // const persistenceModule = new PersistenceModule()
            // await persistenceModule.start();
            const processInstancesId = crypto.randomUUID();
            await EventStore.apply({
                id: crypto.randomUUID(),
                streamId: StreamIds.PROCESS_INSTANCE,
                type: "CREATE_PROCESS_INSTANCE",
                streamPosition: 0,
                data: {
                    id: processInstancesId,
                    wpid: "wpid",
                    processDef: "processDef",
                    status: 0,
                    version: "1.0.0",
                    containerId: crypto.randomUUID()
                },
                timestamp: new Date().toString()
            });

            await EventStore.apply({
                id: crypto.randomUUID(),
                streamId: StreamIds.PROCESS_INSTANCE,
                type: "CLOSE_PROCESS_INSTANCE",
                streamPosition: 0,
                data: {
                    id: processInstancesId,
                    containerId: crypto.randomUUID()
                },
                timestamp: new Date().toString()
            });

            await sleep(500)
            const repo = new ProcessInstanceRepository();
            const processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)

            expect(processInstanceEntity.status).toEqual(1);
            expect(processInstanceEntity.lock).toEqual(null);

            // await persistenceModule.dispose()

        })


});