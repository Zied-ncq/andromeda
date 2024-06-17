/**
 * Model used using container code-gen phase
 */

export class ContainerParsingContext {
  constructor(config) {
    this.deploymentId = config && config.deploymentId;
    this.port = config && config.port;
    this.isTestContainer = config && config.isTestContainer;
    this.workflowParsingContext= [];
  }

  /**
   * isTestContainer is to specify if the current container is used for testing purpose
   * @property {boolean} isTestContainer
   * @protected
   */
  isTestContainer;
  /**
   * includeGalaxyModule  to load Galaxy Module in the current container
   * @property {boolean} includeGalaxyModule
   * @protected
   */
  includeGalaxyModule;
  /**
   * includeWebModule  to load Web Module in the current container
   * @property {boolean} includeWebModule
   * @protected
   */
  includeWebModule;
  /**
   * includePersistenceModule  to load Persistence in the current container
   * @property {boolean} includePersistenceModule
   * @protected
   */
  includePersistenceModule;
  /**
   * deploymentId is the id of the container, it should be unique as it represents the folder in which the code
   * will be generated
   * @property {string} deploymentId
   * @protected
   */
  deploymentId;

  /**
   * port is the port on which the web server will listen
   * @property {number} port
   * @protected
   */
  port;

  /**
   * workflowParsingContext
   * @property {string} workflowParsingContext
   * @protected
   */
  workflowParsingContext;

}
