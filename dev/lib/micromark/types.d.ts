import type { TokenTypeMap as _TokenTypeMap } from "micromark-util-types";

declare module "micromark-util-types" {
  interface TokenTypeMap extends _TokenTypeMap {
    spoilerContainer: "spoilerContainer";
    spoilerContainerFence: "spoilerContainerFence";
    spoilerContainerContent: "spoilerContainerContent";
    spoilerLabel: "spoilerLabel";
  }

  interface CompileData extends _CompileData {
    spoilerStack: any[];
  }
}
