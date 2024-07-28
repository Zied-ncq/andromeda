import {EventStore} from "./internal/event-store.js";
import PersistenceModule from "../persistence.module.js";
import mongoose from "mongoose";
import {StreamIds} from "./streams/stream-ids.js";
import {ProcessInstanceRepository} from "./repositories/process-instance.repository.js";
import {ProcessInstanceStatus} from "../../../config/constants.js";


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

    it('Insert event',
        async () => {

            const processInstancesId = crypto.randomUUID()
            const containerId = crypto.randomUUID()
            await EventStore.apply({
                id: crypto.randomUUID(),
                streamId: "PROCESS_INSTANCE",
                type: "CREATE_PROCESS_INSTANCE",
                streamPosition: 0,
                data: {
                    id: processInstancesId,
                    wpid: "wpid",
                    version: '1.0.0',
                    status: 0,
                    containerId
                },
                timestamp: new Date().toString()
            });
            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)

            expect(processInstanceEntity).toBeDefined()
            expect(processInstanceEntity.id).toEqual(processInstancesId)
            expect(processInstanceEntity.wpid).toEqual("wpid")
            expect(processInstanceEntity.version).toEqual("1.0.0")
            expect(processInstanceEntity.status).toEqual(0)
            expect(processInstanceEntity.lock).toBeDefined()
            expect(processInstanceEntity.lock.containerId).toEqual(containerId)

        })

    it('apply container lock after Create process instance ',
        async () => {

            const containerId = crypto.randomUUID()

            const processInstancesId = crypto.randomUUID();
            await EventStore.apply({
                id: crypto.randomUUID(),
                streamId: StreamIds.PROCESS_INSTANCE,
                type: "CREATE_PROCESS_INSTANCE",
                streamPosition: 0,
                data: {
                    id: processInstancesId,
                    wpid: "wpid",
                    status: 0,
                    version: "1.0.0",
                    containerId
                },
                timestamp: new Date().toString()
            });

            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity.lock).not.toBe(null);
            expect(processInstanceEntity.lock.containerId).toEqual(containerId)
    });

    it('Close process instance and release lock',
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
                    status: 0,
                    version: "1.0.0",
                    containerId: crypto.randomUUID()
                },
                timestamp: new Date().toString()
            });

            const repo = new ProcessInstanceRepository();
            let processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)
            expect(processInstanceEntity.lock).not.toBe(null);

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
            processInstanceEntity = await repo.getProcessInstanceById(processInstancesId)

            expect(processInstanceEntity.status).toEqual(ProcessInstanceStatus.Completed);
            expect(processInstanceEntity.lock).toEqual(null);

        });


});