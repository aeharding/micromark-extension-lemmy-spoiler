/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-util-types').Handle} _Handle
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * @typedef {Record<string, Handle>} HtmlOptions
 *   Configuration.
 *
 *   > 👉 **Note**: the special field `'*'` can be used to specify a fallback
 *   > handle to handle all otherwise unhandled spoilers.
 *
 * @callback Handle
 *   Handle a spoiler.
 * @param {CompileContext} this
 *   Current context.
 * @param {Spoiler} spoiler
 *   Spoiler.
 * @returns {boolean | undefined}
 *   Signal whether the spoiler was handled.
 *
 *   Yield `false` to let the fallback (a special handle for `'*'`) handle it.
 *
 * @typedef Spoiler
 *   Structure representing a spoiler.
 * @property {SpoilerType} type
 *   Kind.
 * @property {string} name
 *   Name of spoiler.
 * @property {string | undefined} [content]
 *   Compiled HTML content inside spoiler.
 * @property {number | undefined} [_fenceCount]
 *   Private :)
 *
 * @typedef {'spoiler'} SpoilerType
 *   Kind.
 */

import {ok as assert} from 'devlop'

const own = {}.hasOwnProperty

/**
 * Create an extension for `micromark` to support spoilers when serializing
 * to HTML.
 *
 * @param {HtmlOptions | null | undefined} [options={}]
 *   Configuration (default: `{}`).
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions`, to
 *   support spoilers when serializing to HTML.
 */
export function spoilerHtml(options) {
  const options_ = options || {}
  return {
    enter: {
      spoiler() {
        enter.call(this, 'spoiler')
      },
      spoilerContent() {
        this.buffer()
      }
    },
    exit: {
      spoiler: exit,
      spoilerContent: exitContainerContent,
      spoilerFence: exitContainerFence,
      spoilerName: exitName
    }
  }

  /**
   * @this {CompileContext}
   * @param {SpoilerType} type
   */
  function enter(type) {
    let stack = this.getData('spoilerStack')
    if (!stack) this.setData('spoilerStack', (stack = []))
    stack.push({type, name: ''})
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitName(token) {
    const stack = this.getData('spoilerStack')
    assert(stack, 'expected spoiler stack')
    stack[stack.length - 1].name = this.sliceSerialize(token)
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitContainerContent() {
    const data = this.resume()
    const stack = this.getData('spoilerStack')
    assert(stack, 'expected spoiler stack')
    stack[stack.length - 1].content = data
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitContainerFence() {
    const stack = this.getData('spoilerStack')
    assert(stack, 'expected spoiler stack')
    const spoiler = stack[stack.length - 1]
    if (!spoiler._fenceCount) spoiler._fenceCount = 0
    spoiler._fenceCount++
    if (spoiler._fenceCount === 1) this.setData('slurpOneLineEnding', true)
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exit() {
    const stack = this.getData('spoilerStack')
    assert(stack, 'expected spoiler stack')
    const spoiler = stack.pop()
    assert(spoiler, 'expected spoiler')
    /** @type {boolean | undefined} */
    let found
    /** @type {boolean | undefined} */
    let result

    assert(spoiler.name, 'expected `name`')

    if (!found && own.call(options_, '*')) {
      result = options_['*'].call(this, spoiler)
      found = result !== false
    }

    if (!found) {
      this.setData('slurpOneLineEnding', true)
    }
  }
}
