/**
 * @typedef {import('micromark-util-types').Extension} Extension
 */

import {codes} from 'micromark-util-symbol'
import {spoiler as spoilerExtension} from './spoiler.js'

/**
 * Create an extension for `micromark` to enable lemmy spoiler syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable lemmy spoiler syntax.
 */
export function spoiler() {
  return {
    flow: {[codes.colon]: [spoilerExtension]}
  }
}
