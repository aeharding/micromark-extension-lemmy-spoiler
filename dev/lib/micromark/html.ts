// /// <reference path="./types.d.ts" />

// import { ok as assert } from "devlop";
// import { CompileContext, HtmlExtension } from "micromark-util-types";

// /**
//  * Create an extension for `micromark` to support directives when serializing
//  * to HTML.
//  *
//  * @returns {HtmlExtension}
//  *   Extension for `micromark` that can be passed in `htmlExtensions`, to
//  *   support directives when serializing to HTML.
//  */
// export function directiveHtml(): HtmlExtension {
//   return {
//     enter: {
//       spoilerContainer() {
//         this.tag("<details>");
//       },
//       spoilerContainerContent() {
//         this.buffer();
//       },
//     },
//     exit: {
//       spoilerContainer() {
//         this.tag("</details>");
//       },
//       spoilerContainerContent() {
//         const data = this.resume();

//         this.raw(data);
//       },
//     },
//   };
// }

/// <reference path="./types.d.ts" />

import { ok as assert } from "devlop";
import { CompileContext, HtmlExtension } from "micromark-util-types";

/**
 * Create an extension for `micromark` to support directives when serializing
 * to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions`, to
 *   support directives when serializing to HTML.
 */
export function directiveHtml(): HtmlExtension {
  return {
    enter: {
      spoilerContainer() {
        enter.call(this);
      },
      spoilerContainerContent() {
        this.buffer();
      },
      spoilerLabel: enterSpoilerLabel,
    },
    exit: {
      spoilerContainer: exit,
      spoilerContainerContent: exitContainerContent,
      spoilerContainerFence: exitContainerFence,
      spoilerLabel: exitSpoilerLabel,
    },
  };

  function enter(this: CompileContext) {
    let stack = this.getData("spoilerStack");
    if (!stack) this.setData("spoilerStack", (stack = []));
    stack.push({ type: "spoilerContainer" });

    this.tag("<details>");
  }

  function exitContainerContent(this: CompileContext): undefined {
    const data = this.resume();
    const stack = this.getData("spoilerStack");
    assert(stack, "expected directive stack");
    stack[stack.length - 1].content = data;
  }

  function enterSpoilerLabel(this: CompileContext): undefined {
    this.tag("<summary>");
    this.buffer();
  }

  function exitSpoilerLabel(this: CompileContext): undefined {
    const data = this.resume();
    this.raw(data);

    this.tag("</summary>");
  }

  function exitContainerFence(this: CompileContext): undefined {
    const stack = this.getData("spoilerStack");
    assert(stack, "expected directive stack");
    const directive = stack[stack.length - 1];
    if (!directive._fenceCount) directive._fenceCount = 0;
    directive._fenceCount++;
    if (directive._fenceCount === 1) this.setData("slurpOneLineEnding", true);
  }

  function exit(this: CompileContext): undefined {
    const stack = this.getData("spoilerStack");
    assert(stack, "expected directive stack");
    const directive = stack.pop();
    assert(directive, "expected directive");
    // /** @type {boolean | undefined} */
    // let found
    // /** @type {boolean | undefined} */
    // let result

    // if (own.call(options_, directive.name)) {
    //   result = options_[directive.name].call(this, directive)
    //   found = result !== false
    // }

    // if (!found && own.call(options_, '*')) {
    //   result = options_['*'].call(this, directive)
    //   found = result !== false
    // }

    this.raw(directive.content);
    this.lineEndingIfNeeded();
    this.tag("</details>");

    if (directive.type !== "textDirective") {
      this.setData("slurpOneLineEnding", true);
    }
  }
}
