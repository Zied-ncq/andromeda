import {AFlow} from './a-flow.js'

export class ANode {

    /**
     * @property {string} id
     * @public
     */
    id

    /**
     * @property {'StartEvent' | 'EndEvent'} type
     * @public
     */
    type

    /**
     * @property {AFlow[]} flows
     * @public
     */
    flows

    /**
     * @property {object} id
     * @public
     */
    content
}