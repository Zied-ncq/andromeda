

import EngineService from "../../engine.service.js";
import Utils from "../../../../utils/utils.js";
import * as fs from "fs";
import {EmbeddedContainerService} from "../embedded.containers.service.js";

class EmbeddedServerController {


    static runEmbeddedContainer = async (req, reply) => {

        if(!req.body.wpid){
            throw new Error("wpid must be specified");
        }
        const wpid =req.body.wpid
        try {
            await EmbeddedContainerService.startEmbeddedContainer(wpid, {});
            return {};
        } catch (err) {
            const returnError = new Error();
            returnError.statusCode = 500;
            returnError.message = err;
            returnError.stack=err;
            throw returnError;
        }
    }

}

export default EmbeddedServerController