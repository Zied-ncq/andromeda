

import EngineService from "../../engine.service.js";
import Utils from "../../../../utils/utils.js";
import * as fs from "fs";

class ServerController {

    static compile = async (req, reply) => {
        if(!req.files || req.files.length === 0){
            throw new Error("at least a bpmn file must be specified");
        }
        if(!req.body.wpid){
            throw new Error("wpid (workflow process id) must be specified");
        }

        if(!req.body.version){
            throw new Error("workflow process version must be specified");
        }
        //
        let includeGalaxyModule;
        if(req.body.includeGalaxyModule){
            includeGalaxyModule = req.body.includeGalaxyModule === "true";
        }else{
            includeGalaxyModule = false;
        }

        try {
            let fileContents = [];
            for(let fileIndex in req.files){
                fileContents.push(fs.readFileSync(req.files[fileIndex].path, {encoding: 'utf8'}));
            }


            await new EngineService().generateContainer(fileContents, req.body.wpid, req.body.version, {
                includeGalaxyModule: true,
                includePersistenceModule: true,
                includeWebModule: true,
            });
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

export default ServerController