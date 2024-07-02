// import test from "ava";
// import {EventStore} from "./event-store.js";
// import {v4} from "uuid";
// import PersistenceModule from "../persistence.module.js";
//
//
//
//
// test.before(async () => {
// });
//
// test.after(async () => {
// })
//
//
//
//
//
// test('Inert event',
//     /**
//      *
//      * @param {Assertions}t
//      * @returns {Promise<void>}
//      */
//     async (t) => {
//         await PersistenceModule.init();
//         await EventStore.apply({
//             id: crypto.randomUUID(),
//             streamId: "PROCESS_INSTANCE",
//             type: "CREATE_PROCESS_INSTANCE",
//             streamPosition: 0,
//             data:{
//                 id: crypto.randomUUID(),
//                 wpid: "wpid",
//                 processDef: "processDef",
//                 status: 0,
//                 containerId: crypto.randomUUID()
//             },
//             timestamp: new Date().toString()
//         });
//
//         await EventStore.apply({
//             id: crypto.randomUUID(),
//             streamId: "PROCESS_INSTANCE",
//             type: "CREATE_PROCESS_INSTANCE",
//             streamPosition: 0,
//             data:{
//                 id: crypto.randomUUID(),
//                 wpid: "wpid",
//                 processDef: "processDef",
//                 status: 0,
//                 containerId: crypto.randomUUID()
//             },
//             timestamp: new Date().toString()
//         });
//         t.pass();
//
//     })
//
//
//
// test('Create/Close process instance',
//     /**
//      *
//      * @param {Assertions}t
//      * @returns {Promise<void>}
//      */
//     async (t) => {
//         await PersistenceModule.init();
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
//         t.pass();
//
//     })
//
//
//
