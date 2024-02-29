import type {Attribute, Directive} from './lib/html.js'

export {spoiler} from './lib/syntax.js'
export {
  spoilerHtml,
  type Directive,
  type Handle,
  type HtmlOptions
} from './lib/html.js'

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    spoiler: 'spoiler'
    spoilerAttributes: 'spoilerAttributes'
    spoilerAttributesMarker: 'spoilerAttributesMarker'
    spoilerAttribute: 'spoilerAttribute'
    spoilerAttributeId: 'spoilerAttributeId'
    spoilerAttributeIdValue: 'spoilerAttributeIdValue'
    spoilerAttributeClass: 'spoilerAttributeClass'
    spoilerAttributeClassValue: 'spoilerAttributeClassValue'
    spoilerAttributeName: 'spoilerAttributeName'
    spoilerAttributeInitializerMarker: 'spoilerAttributeInitializerMarker'
    spoilerAttributeValueLiteral: 'spoilerAttributeValueLiteral'
    spoilerAttributeValue: 'spoilerAttributeValue'
    spoilerAttributeValueMarker: 'spoilerAttributeValueMarker'
    spoilerAttributeValueData: 'spoilerAttributeValueData'
    spoilerContent: 'spoilerContent'
    spoilerFence: 'spoilerFence'
    spoilerLabel: 'spoilerLabel'
    spoilerLabelMarker: 'spoilerLabelMarker'
    spoilerLabelString: 'spoilerLabelString'
    spoilerName: 'spoilerName'
    spoilerSequence: 'spoilerSequence'
  }

  interface CompileData {
    spoilerAttributes?: Attribute[]
    spoilerStack?: Directive[]
  }
}
