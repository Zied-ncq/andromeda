
import { test } from "node:test"
import mongoose from "mongoose";
import BaseRepository from "../../src/modules/persistence/event-store/repositories/baseRepository.js";
import TestModel from "../../src/modules/persistence/event-store/internal/models/test-model.js";



    let db;
    test.before(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
        db = mongoose.connection.db
    });

    test.after( async ()=>{
        await mongoose.disconnect();
    })


    test('Count repository',
        /**
         *
         * @param  {Assertions} t
         * @returns {Promise<void>}
         */
        async (t) => {
        try{
            const id = crypto.randomUUID()
            const notFoundId = crypto.randomUUID()
            let repo = new BaseRepository(TestModel);
            const count = await repo.count({_id: id})
            t.is(count, 0);
            await repo.create({_id: id, value : "val" })
            t.is(await repo.count({_id: id}), 1);
            t.is(await repo.count({_id: notFoundId}), 0);
            await repo.delete(id)
            t.is(await repo.count({_id: id}), 0);
            t.pass()
        }catch (e) {
            console.error(e)
        }

    })

//
// test('upsert repository',
//     /**
//      *
//      * @param  {Assertions} t
//      * @returns {Promise<void>}
//      */
//     async (t) => {
//         try{
//             const id = crypto.randomUUID()
//             let repo = new BaseRepository(ProcessInstanceModel);
//             const count = await repo.count({_id: id})
//             t.is(count, 0);
//             await repo.upsert({_id: id}, {_id: id, value : "val"})
//             t.is(await repo.count({_id: id}), 1);
//             await repo.upsert({_id: id}, {_id: id, value : "val"})
//             t.is(await repo.count({_id: id}), 1);
//             await repo.delete(id)
//             t.is(await repo.count({_id: id}), 0);
//             t.pass()
//         }catch (e) {
//             console.error(e)
//         }
//
//     })


