import type { Parent, BlockContent, DefinitionContent } from "mdast";

/**
 * Markdown directive (container form).
 */
export interface SpoilerContainer extends Parent {
  /**
   * Node type of container directive.
   */
  type: "spoilerContainer";

  /**
   * Children of container directive.
   */
  children: Array<BlockContent | DefinitionContent>;
}

// Add custom data tracked to turn a syntax tree into markdown.
declare module "mdast-util-to-markdown" {
  interface ConstructNameMap {
    /**
     * Whole container directive.
     *
     * ```markdown
     * > | :::a
     *     ^^^^
     * > | :::
     *     ^^^
     * ```
     */
    spoilerContainer: "spoilerContainer";

    /**
     * Label of a container directive.
     *
     * ```markdown
     * > | :::a[b]
     *         ^^^
     *   | :::
     * ```
     */
    spoilerContainerLabel: "spoilerContainerLabel";
  }
}

// Add nodes to content, register `data` on paragraph.
declare module "mdast" {
  interface BlockContentMap {
    /**
     * Directive in flow content (such as in the root document, or block
     * quotes), which contains further flow content.
     */
    spoilerContainer: SpoilerContainer;
  }

  interface RootContentMap {
    /**
     * Directive in flow content (such as in the root document, or block
     * quotes), which contains further flow content.
     */
    spoilerContainer: SpoilerContainer;
  }
}
