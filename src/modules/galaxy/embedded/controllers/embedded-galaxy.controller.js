

class EmbeddedGalaxyController {


    static getProcessInstances = async (req, reply) => {


        try {
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

export default EmbeddedGalaxyController