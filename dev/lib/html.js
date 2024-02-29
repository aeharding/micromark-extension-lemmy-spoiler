/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-util-types').Handle} _Handle
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * @typedef {[string, string]} Attribute
 *   Internal tuple representing an attribute.
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
 * @property {string | undefined} [label]
 *   Compiled HTML content that was in `[brackets]`.
 * @property {Record<string, string> | undefined} [attributes]
 *   Object w/ HTML attributes.
 * @property {string | undefined} [content]
 *   Compiled HTML content inside spoiler.
 * @property {number | undefined} [_fenceCount]
 *   Private :)
 *
 * @typedef {'spoiler'} SpoilerType
 *   Kind.
 */

import {ok as assert} from 'devlop'
import {parseEntities} from 'parse-entities'

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
      spoilerAttributes: enterAttributes,
      spoilerLabel: enterLabel,
      spoilerContent() {
        this.buffer()
      }
    },
    exit: {
      spoiler: exit,
      spoilerAttributeClassValue: exitAttributeClassValue,
      spoilerAttributeIdValue: exitAttributeIdValue,
      spoilerAttributeName: exitAttributeName,
      spoilerAttributeValue: exitAttributeValue,
      spoilerAttributes: exitAttributes,
      spoilerContent: exitContainerContent,
      spoilerFence: exitContainerFence,
      spoilerLabel: exitLabel,
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
  function enterLabel() {
    this.buffer()
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitLabel() {
    const data = this.resume()
    const stack = this.getData('spoilerStack')
    assert(stack, 'expected spoiler stack')
    stack[stack.length - 1].label = data
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function enterAttributes() {
    this.buffer()
    this.setData('spoilerAttributes', [])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeIdValue(token) {
    const attributes = this.getData('spoilerAttributes')
    assert(attributes, 'expected attributes')
    attributes.push([
      'id',
      parseEntities(this.sliceSerialize(token), {
        attribute: true
      })
    ])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeClassValue(token) {
    const attributes = this.getData('spoilerAttributes')
    assert(attributes, 'expected attributes')

    attributes.push([
      'class',
      parseEntities(this.sliceSerialize(token), {
        attribute: true
      })
    ])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeName(token) {
    // Attribute names in CommonMark are significantly limited, so character
    // references can’t exist.
    const attributes = this.getData('spoilerAttributes')
    assert(attributes, 'expected attributes')

    attributes.push([this.sliceSerialize(token), ''])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeValue(token) {
    const attributes = this.getData('spoilerAttributes')
    assert(attributes, 'expected attributes')
    attributes[attributes.length - 1][1] = parseEntities(
      this.sliceSerialize(token),
      {attribute: true}
    )
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributes() {
    const stack = this.getData('spoilerStack')
    assert(stack, 'expected spoiler stack')
    const attributes = this.getData('spoilerAttributes')
    assert(attributes, 'expected attributes')
    /** @type {Spoiler['attributes']} */
    const cleaned = {}
    let index = -1

    while (++index < attributes.length) {
      const attribute = attributes[index]

      if (attribute[0] === 'class' && cleaned.class) {
        cleaned.class += ' ' + attribute[1]
      } else {
        cleaned[attribute[0]] = attribute[1]
      }
    }

    this.resume()
    this.setData('spoilerAttributes')
    stack[stack.length - 1].attributes = cleaned
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

    if (own.call(options_, spoiler.name)) {
      result = options_[spoiler.name].call(this, spoiler)
      found = result !== false
    }

    if (!found && own.call(options_, '*')) {
      result = options_['*'].call(this, spoiler)
      found = result !== false
    }

    if (!found) {
      this.setData('slurpOneLineEnding', true)
    }
  }
}
