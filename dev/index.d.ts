import type {Spoiler} from './lib/html.js'

export {spoiler} from './lib/syntax.js'
export {
  spoilerHtml,
  type Spoiler,
  type Handle,
  type HtmlOptions
} from './lib/html.js'

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    spoiler: 'spoiler'
    spoilerContent: 'spoilerContent'
    spoilerFence: 'spoilerFence'
    spoilerName: 'spoilerName'
    spoilerSequence: 'spoilerSequence'
  }

  interface CompileData {
    spoilerStack?: Spoiler[]
  }
}
