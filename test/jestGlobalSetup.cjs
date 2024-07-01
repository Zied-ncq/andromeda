

module.exports = async function (globalConfig, projectConfig) {
    console.log(`---------------------------------->`)
    // Set reference to mongod in order to close the server during teardown.
    process.env.PROFILE='test'

};