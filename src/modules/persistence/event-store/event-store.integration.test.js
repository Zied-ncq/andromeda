import {EventStore} from "./event-store.js";
import PersistenceModule from "../persistence.module.js";
import mongoose from "mongoose";


const persistenceModule = new PersistenceModule()
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
            data:{
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
            data:{
                id: crypto.randomUUID(),
                wpid: "wpid",
                processDef: "processDef",
                status: 0,
                // version: '1.0.0',
                containerId: crypto.randomUUID()
            },
            timestamp: new Date().toString()
        });

    })

// it('Create/Close process instance',
//     /**
//      *
//      * @param {Assertions}t
//      * @returns {Promise<void>}
//      */
//     async () => {
//         // const persistenceModule = new PersistenceModule()
//         // await persistenceModule.start();
//         const processInstancesId= crypto.randomUUID();
//         await EventStore.apply({
//             id:  crypto.randomUUID(),
//             streamId: "PROCESS_INSTANCE",
//             type: "CREATE_PROCESS_INSTANCE",
//             streamPosition: 0,
//             data:{
//                 id: processInstancesId,
//                 wpid: "wpid",
//                 processDef: "processDef",
//                 status: 0,
//                 containerId: crypto.randomUUID()
//             },
//             timestamp: new Date().toString()
//         });
//
//         await EventStore.apply({
//             id:  crypto.randomUUID(),
//             streamId: "PROCESS_INSTANCE",
//             type: "CLOSE_PROCESS_INSTANCE",
//             streamPosition: 0,
//             data:{
//                 id: processInstancesId,
//                 containerId: crypto.randomUUID()
//             },
//             timestamp: new Date().toString()
//         });
//
//         // await persistenceModule.dispose()
//
//     })



