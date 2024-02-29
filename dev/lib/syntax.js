/**
 * @typedef {import('micromark-util-types').Extension} Extension
 */

import {codes} from 'micromark-util-symbol'
import {directiveContainer} from './directive-container.js'

/**
 * Create an extension for `micromark` to enable directive syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable directive syntax.
 */
export function spoiler() {
  return {
    flow: {[codes.colon]: [directiveContainer]}
  }
}
