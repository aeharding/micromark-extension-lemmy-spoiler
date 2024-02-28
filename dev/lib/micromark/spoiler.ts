import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding } from "micromark-util-character";
import { codes, constants, types } from "micromark-util-symbol";
import {
  Code,
  Construct,
  Effects,
  State,
  Token,
  TokenizeContext,
} from "micromark-util-types";

export const spoilerContainer: Construct = {
  tokenize: tokenizeSpoilerContainer,
  concrete: true,
};

const name = "spoiler" as const;

const nonLazyLine = { tokenize: tokenizeNonLazyLine, partial: true };

function tokenizeSpoilerContainer(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
) {
  const self = this;
  const tail = self.events[self.events.length - 1];
  const initialSize =
    tail && tail[1].type === types.linePrefix
      ? tail[2].sliceSerialize(tail[1], true).length
      : 0;
  let sizeOpen = 0;
  let namePos = 0;
  let previous: Token;

  return start;

  function start(code: Code) {
    assert(code === codes.colon, "expected `:`");
    effects.enter("spoilerContainer");
    return sequenceOpen(code);
  }

  function sequenceOpen(code: Code) {
    if (code === codes.colon) {
      effects.consume(code);
      sizeOpen++;
      return sequenceOpen;
    }

    if (sizeOpen < constants.codeFencedSequenceSizeMin) {
      return nok(code);
    }

    if (code === codes.space) {
      effects.consume(code);
      return sequenceOpen;
    }

    return afterColons(code);
  }

  function afterColons(code: Code) {
    if (code === name.codePointAt(namePos)) {
      effects.consume(code);
      namePos++;
      return afterColons;
    }

    effects.enter("spoilerLabel");
    const token = effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
      previous,
    });
    if (previous) previous.next = token;
    previous = token;
    return getLabelData(code);
  }

  function getLabelData(code: Code) {
    if (code === codes.eof) {
      return nok(code);
    }

    if (markdownLineEnding(code)) {
      effects.consume(code);
      effects.exit(types.chunkText);
      effects.exit("spoilerLabel");
      return openAfter;
    }

    effects.consume(code);
    return getLabelData;
  }

  function openAfter(code: Code) {
    if (code === codes.eof) {
      return nok(code);
    }

    if (markdownLineEnding(code)) {
      if (self.interrupt) {
        return ok(code);
      }
    }

    return effects.attempt(nonLazyLine, contentStart, afterOpening)(code);
  }

  function afterOpening(code: Code) {
    effects.exit("spoilerContainer");
    return ok(code);
  }

  function contentStart(code: Code) {
    effects.enter("spoilerContainerContent");
    return lineStart(code);
  }

  function lineStart(code: Code) {
    if (code === codes.eof) {
      return after(code);
    }

    return effects.attempt(
      { tokenize: tokenizeClosingFence, partial: true },
      after,
      initialSize
        ? factorySpace(effects, chunkStart, types.linePrefix, initialSize + 1)
        : chunkStart,
    )(code);
  }

  function chunkStart(code: Code) {
    if (code === codes.eof) {
      return after(code);
    }

    const token = effects.enter(types.chunkDocument, {
      contentType: constants.contentTypeDocument,
      previous,
    });
    if (previous) previous.next = token;
    previous = token;
    return contentContinue(code);
  }

  function contentContinue(code: Code) {
    if (code === codes.eof) {
      const t = effects.exit(types.chunkDocument);
      self.parser.lazy[t.start.line] = false;
      return after(code);
    }

    if (markdownLineEnding(code)) {
      return effects.check(nonLazyLine, nonLazyLineAfter, lineAfter)(code);
    }

    effects.consume(code);
    return contentContinue;
  }

  function nonLazyLineAfter(code: Code) {
    effects.consume(code);
    const t = effects.exit(types.chunkDocument);
    self.parser.lazy[t.start.line] = false;
    return lineStart;
  }

  function lineAfter(code: Code) {
    const t = effects.exit(types.chunkDocument);
    self.parser.lazy[t.start.line] = false;
    return after(code);
  }

  function after(code: Code) {
    effects.exit("spoilerContainerContent");
    effects.exit("spoilerContainer");
    return ok(code);
  }

  function tokenizeClosingFence(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
  ) {
    let size = 0;

    return factorySpace(
      effects,
      closingPrefixAfter,
      types.linePrefix,
      constants.tabSize,
    );

    function closingPrefixAfter(code: Code) {
      return closingSequence(code);
    }

    function closingSequence(code: Code) {
      if (code === codes.colon) {
        effects.consume(code);
        size++;
        return closingSequence;
      }

      if (size < sizeOpen) return nok(code);
      return factorySpace(effects, closingSequenceEnd, types.whitespace)(code);
    }

    function closingSequenceEnd(code: Code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        return ok(code);
      }

      return nok(code);
    }
  }
}

function tokenizeNonLazyLine(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
) {
  const self = this;

  return start;

  function start(code: Code) {
    console.log(code);
    assert(markdownLineEnding(code), "expected eol");
    effects.enter(types.lineEnding);
    effects.consume(code);
    effects.exit(types.lineEnding);
    return lineStart;
  }

  function lineStart(code: Code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
  }
}
