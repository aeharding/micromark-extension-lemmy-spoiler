/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-util-types').Handle} _Handle
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
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

/**
 * Create an extension for `micromark` to support spoilers when serializing
 * to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions`, to
 *   support spoilers when serializing to HTML.
 */
export function spoilerHtml() {
  return {
    enter: {
      spoiler() {
        enter.call(this)
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
   */
  function enter() {
    let stack = this.getData('spoilerStack')
    if (!stack) this.setData('spoilerStack', (stack = []))
    stack.push({type: 'spoiler', name: ''})
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
    assert(spoiler.name, 'expected `name`')

    this.tag('<details>')

    if (spoiler.content) {
      this.lineEndingIfNeeded()
      this.raw(spoiler.content)
      this.lineEndingIfNeeded()
    }

    this.tag('</details>')
  }
}
