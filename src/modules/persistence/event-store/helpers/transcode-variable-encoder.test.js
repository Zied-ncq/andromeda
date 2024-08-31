
import {VariableEncoder} from "./variable-encoder.js";
import Utils from "../../../../utils/utils.js";
import {describe} from "vitest";
import { expect, test , beforeAll, afterAll, describe } from 'vitest'



function evaluate(expression) {
    let code = ` ${expression}; `;

    try {
        return eval(code);
    } catch (e) {
        log.error(e);
        throw e;
    }
}
let val;

class LoremClass {
    id
    value
}


function isObject(val) {
    return (typeof val === 'object');
}

describe.concurrent('Engine tests', ()=> {
    test('Transcode object',
        /**
         *
         * @param {Assertions} t
         * @returns {Promise<void>}
         */
        async () => {

            let strVal = `{"id": "idLorem" , "value": "valueIpsum"}`;
            val = VariableEncoder.transcodeVariable(strVal, "LoremClass", "objVar")
            expect(isObject(val)).toBe(true)
            expect(val.id).toBe("idLorem")
            expect(val.value).toBe("valueIpsum")

        })

    test('Transcode Array of objects',
        /**
         *
         * @param {Assertions} t
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = `[{"id": "idLorem" , "value": "valueIpsum"}]`;
            val = VariableEncoder.transcodeVariable(strVal, "Array<LoremClass>", "arrayVar")
            expect(Array.isArray(val)).toBe(true)
            expect((val[0].id)).toBe("idLorem")
            expect((val[0].value)).toBe("valueIpsum")

        })

    test('Transcode Boolean Variable',
        /**
         *
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = "";
            val = VariableEncoder.transcodeVariable(strVal, "boolean", "boolVar")
            expect(VariableEncoder.isPrimitiveValue(val)).toBe(true)
            expect(val).toBe(false)

            strVal = "false";
            val = VariableEncoder.transcodeVariable(strVal, "boolean", "boolVar")
            expect(VariableEncoder.isPrimitiveValue(val)).toBe(true)
            expect(val).toBe(false)

            strVal = "true";
            val = VariableEncoder.transcodeVariable(strVal, "boolean", "boolVar")
            expect(VariableEncoder.isPrimitiveValue(val)).toBe(true)
            expect(val).toBe(true);

            strVal = "notValidValue";
            const error = await Utils.getError(() => VariableEncoder.transcodeVariable(strVal, "boolean", "boolVar"))
            expect(error).toEqual(new Error('cannot transcode variable boolVar of type boolean, possible values [true|false|""]'))

            strVal = undefined;
            val = VariableEncoder.transcodeVariable(strVal, "boolean", "boolVar")
            expect(VariableEncoder.isPrimitiveValue(val)).toBe(true)
            expect(val).toBe(undefined);


        })

    test('Transcode string value',
        /**
         *
         * @param {Assertions} t
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = `valueIpsum`;
            val = VariableEncoder.transcodeVariable(strVal, "string", "arrayVar")
            expect(val).toBe("valueIpsum")

        })

    test('Transcode integer value',
        /**
         *
         * @param {Assertions} t
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = `50`;
            val = VariableEncoder.transcodeVariable(strVal, "number", "numberVal")
            expect(val).toBe(50)

        })


    test('Transcode float value',
        /**
         *
         * @param {Assertions} t
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = `50.4`;
            val = VariableEncoder.transcodeVariable(strVal, "number", "floatVal")
            expect(val).toBe(50.4)

        })

    test('Transcode uuid value as string',
        /**
         *
         * @param {Assertions} t
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = `a0221430-a7ff-ac48-1ec6-8d21674e8464`;
            val = VariableEncoder.transcodeVariable(strVal, "string", "uuidVal")
            expect(val).toBe("a0221430-a7ff-ac48-1ec6-8d21674e8464")

        })

    test('Transcode date value',
        /**
         *
         * @returns {Promise<void>}
         */
        async () => {
            let strVal = `2022-01-01T12:00:00+01:00`;
            val = VariableEncoder.transcodeVariable(strVal, "Date", "dateVal")
            expect(val).toEqual(new Date(Date.parse(strVal)))
        })

})
