import {AVariable} from './a-variable.js'
import {ANode} from './a-node.js'

export class AProcess {

    /**
     * @property {string} id
     * @public
     */
    id

    /**
     * @property {string} version
     * @public
     */
    version

    /**
     * @property {AVariable[]} variables
     * @public
     */
    variables

    /**
     * @property {ANode[]} nodes
     * @public
     */
    nodes

    /**
     * @property {AProcess[]} nodes
     * @public
     */
    subProcesses


}