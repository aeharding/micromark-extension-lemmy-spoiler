import { codes } from "micromark-util-symbol";
import { spoilerContainer } from "./spoiler.js";
import { Extension } from "micromark-util-types";

/**
 * Create an extension for `micromark` to enable directive syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable directive syntax.
 */
export function directive(): Extension {
  return {
    flow: { [codes.colon]: [spoilerContainer] },
  };
}
