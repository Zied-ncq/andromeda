/**
 * Model used using container code-gen phase
 */

export class ContainerParsingContext {
  constructor(config) {
    this.wpid = config && config.wpid;
    this.version = config && config.version;
    this.port = config && config.port;
    this.isTestContainer = config && config.isTestContainer;
    this.workflowParsingContext= [];
  }

  /**
   * isTestContainer is to specify if the current container is used for testing purpose
   * @property {boolean} isTestContainer
   * @public
   */
  isTestContainer;

  /**
   * includeGalaxyModule  to load Galaxy Module in the current container
   * @property {boolean} includeGalaxyModule
   * @public
   */
  includeGalaxyModule;

  /**
   * includeWebModule  to load Web Module in the current container
   * @property {boolean} includeWebModule
   * @public
   */
  includeWebModule;

  /**
   * includePersistenceModule  to load Persistence in the current container
   * @property {boolean} includePersistenceModule
   * @public
   */
  includePersistenceModule;

  /**
   * wpid is the id of the process, it should be unique as it represents the folder in which the code
   * will be generated
   * @property {string} wpid
   * @public
   */
  wpid;


  /**
   * version of the process
   * @property {string} version
   * @public
   */
  version;


  /**
   * port is the port on which the web server will listen
   * @property {number} port
   * @public
   */
  port;

  /**
   * workflowParsingContext
   * @property {AProcess[]} workflowParsingContext
   * @public
   */
  workflowParsingContext;

}
