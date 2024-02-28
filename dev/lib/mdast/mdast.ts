import { Token } from "micromark-util-types";
import type { CompileContext } from "mdast-util-from-markdown";
import { visitParents } from "unist-util-visit-parents";
import type { SpoilerContainer } from "./mdast.d.js";
import { Options, State, Info } from "mdast-util-to-markdown";
import type { Parents } from "mdast";

handleDirective.peek = peekDirective;

/**
 * Create an extension for `mdast-util-from-markdown` to enable directives in
 * markdown.
 *
 * @returns Extension for `mdast-util-from-markdown` to enable directives.
 */
export function directiveFromMarkdown() {
  return {
    enter: {
      spoilerContainer: enterContainer,
      spoilerLabel: enterLabel,
    },
    exit: {
      spoilerContainer: exit,
      spoilerLabel: exit,
    },
  };
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable directives in
 * markdown.
 *
 * @returns Extension for `mdast-util-to-markdown` to enable directives.
 */
export function directiveToMarkdown(): Options {
  return {
    unsafe: [
      // {
      //   before: "[^:]",
      //   character: ":",
      //   after: "[A-Za-z]",
      //   inConstruct: ["phrasing"],
      // },
      // { atBreak: true, character: ":", after: ":" },
    ],
    handlers: {
      spoilerContainer: handleDirective,
    },
  };
}

function enterContainer(this: CompileContext, token: Token) {
  enter.call(this, token);
}

function enter(this: CompileContext, token: Token) {
  this.enter({ type: "spoilerContainer", children: [] }, token);
}

function enterLabel(this: CompileContext, token: Token) {
  this.enter({ type: "spoilerLabel", children: [] }, token);
}

function exit(this: CompileContext, token: Token) {
  this.exit(token);
}

function handleDirective(
  node: any,
  parent: Parents | undefined,
  state: State,
  info: Info,
) {
  const tracker = state.createTracker(info);
  const sequence = fence(node);
  const exit = state.enter(node.type);
  let value = tracker.move(sequence + (node.name || ""));

  let shallow = node;

  if (shallow && shallow.children && shallow.children.length > 0) {
    value += tracker.move("\n");
    value += tracker.move(state.containerFlow(shallow, tracker.current()));
  }

  value += tracker.move("\n" + sequence);

  exit();
  return value;
}

function peekDirective() {
  return ":";
}

function fence(node: SpoilerContainer): string {
  let size = 0;

  visitParents(node, function (node, parents) {
    if (node.type === "spoilerContainer") {
      let index = parents.length;
      let nesting = 0;

      while (index--) {
        if (parents[index].type === "spoilerContainer") {
          nesting++;
        }
      }

      if (nesting > size) size = nesting;
    }
  });
  size += 3;

  return ":".repeat(size);
}
