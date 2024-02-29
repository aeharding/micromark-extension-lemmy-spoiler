/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-extension-lemmy-spoiler').HtmlOptions} HtmlOptions
 * @typedef {import('micromark-extension-lemmy-spoiler').Handle} Handle
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {micromark} from 'micromark'
import {htmlVoidElements} from 'html-void-elements'
import {spoiler, spoilerHtml} from 'micromark-extension-lemmy-spoiler'

const own = {}.hasOwnProperty

test('micromark-extension-lemmy-spoiler (core)', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('micromark-extension-lemmy-spoiler')).sort(),
      ['spoiler', 'spoilerHtml']
    )
  })
})

test('micromark-extension-lemmy-spoiler (syntax, container)', async function (t) {
  await t.test('should support a spoiler', async function () {
    assert.equal(micromark(':::spoiler', options()), '')
  })

  await t.test('should support a spoiler with space', async function () {
    assert.equal(micromark('::: spoiler', options()), '')
  })

  await t.test('should support a spoiler with many spaces', async function () {
    assert.equal(micromark(':::    spoiler', options()), '')
  })

  await t.test('should not support a partial spoiler name', async function () {
    assert.equal(micromark(':::spoi', options()), '<p>:::spoi</p>')
  })

  await t.test('should not support too long spoiler name', async function () {
    assert.equal(micromark(':::spoilerr', options()), '<p>:::spoilerr</p>')
  })

  await t.test('should not support one colon', async function () {
    assert.equal(micromark(':', options()), '<p>:</p>')
  })

  await t.test(
    'should not support two colons not followed by an alpha',
    async function () {
      assert.equal(micromark('::', options()), '<p>::</p>')
    }
  )

  await t.test(
    'should not support three colons not followed by an alpha',
    async function () {
      assert.equal(micromark(':::', options()), '<p>:::</p>')
    }
  )

  await t.test(
    'should support three colons followed by an alpha',
    async function () {
      assert.equal(micromark(':::spoiler', options()), '')
    }
  )

  await t.test(
    'should not support three colons followed by a digit',
    async function () {
      assert.equal(micromark(':::9', options()), '<p>:::9</p>')
    }
  )

  await t.test(
    'should not support three colons followed by a dash',
    async function () {
      assert.equal(micromark(':::-', options()), '<p>:::-</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `[`',
    async function () {
      assert.equal(micromark(':::spoiler[', options()), '<p>:::spoiler[</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{`',
    async function () {
      assert.equal(micromark(':::spoiler{', options()), '<p>:::spoiler{</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `[` w/ content',
    async function () {
      assert.equal(micromark(':::spoiler[b', options()), '<p>:::spoiler[b</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{` w/ content',
    async function () {
      assert.equal(micromark(':::spoiler{b', options()), '<p>:::spoiler{b</p>')
    }
  )

  await t.test('should support an empty label', async function () {
    assert.equal(micromark(':::spoiler[]', options()), '')
  })

  await t.test('should support a whitespace only label', async function () {
    assert.equal(micromark(':::spoiler[ \t]', options()), '')
  })

  await t.test('should not support an eol in an label', async function () {
    assert.equal(
      micromark(':::spoiler[\n]', options()),
      '<p>:::spoiler[\n]</p>'
    )
  })

  await t.test('should support content in an label', async function () {
    assert.equal(micromark(':::spoiler[a b c]', options()), '')
  })

  await t.test('should support markdown in an label', async function () {
    assert.equal(micromark(':::spoiler[a *b* c]', options()), '')
  })

  await t.test('should not support content after a label', async function () {
    assert.equal(
      micromark(':::spoiler[]asd', options()),
      '<p>:::spoiler[]asd</p>'
    )
  })

  await t.test('should support empty attributes', async function () {
    assert.equal(micromark(':::spoiler{}', options()), '')
  })

  await t.test('should support whitespace only attributes', async function () {
    assert.equal(micromark(':::spoiler{ \t}', options()), '')
  })

  await t.test('should not support an eol in attributes', async function () {
    assert.equal(
      micromark(':::spoiler{\n}', options()),
      '<p>:::spoiler{\n}</p>'
    )
  })

  await t.test('should support attributes', async function () {
    assert.equal(micromark(':::spoiler{a b c}', options()), '')
  })

  await t.test(
    'should not support EOLs around initializers',
    async function () {
      assert.equal(
        micromark(':::spoiler{f  =\rg}', options()),
        '<p>:::spoiler{f  =\rg}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF in a quoted attribute value',
    async function () {
      assert.equal(
        micromark(':::spoiler{b="c', options()),
        '<p>:::spoiler{b=&quot;c</p>'
      )
    }
  )

  await t.test(
    'should not support EOLs in quoted attribute values',
    async function () {
      assert.equal(
        micromark(':::spoiler{b="\nc\r  d"}', options()),
        '<p>:::spoiler{b=&quot;\nc\rd&quot;}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF after a quoted attribute value',
    async function () {
      assert.equal(
        micromark(':::spoiler{b="c"', options()),
        '<p>:::spoiler{b=&quot;c&quot;</p>'
      )
    }
  )

  await t.test('should support whitespace after spoilers', async function () {
    assert.equal(micromark(':::spoiler{b=c} \t ', options()), '')
  })

  await t.test('should support no closing fence', async function () {
    assert.equal(micromark(':::spoiler\n', options()), '')
  })

  await t.test('should support an immediate closing fence', async function () {
    assert.equal(micromark(':::spoiler\n:::', options()), '')
  })

  await t.test(
    'should support content after a closing fence',
    async function () {
      assert.equal(micromark(':::spoiler\n:::\nb', options()), '<p>b</p>')
    }
  )

  await t.test(
    'should not close w/ a “closing” fence of two colons',
    async function () {
      assert.equal(micromark(':::spoiler\n::\nb', options()), '')
    }
  )

  await t.test(
    'should close w/ a closing fence of more colons',
    async function () {
      assert.equal(micromark(':::spoiler\n::::\nb', options()), '<p>b</p>')
    }
  )

  await t.test('should support more opening colons', async function () {
    assert.equal(micromark('::::spoiler\n::::\nb', options()), '<p>b</p>')
  })

  await t.test(
    'should not close w/ a “closing” fence of less colons than the opening',
    async function () {
      assert.equal(micromark(':::::spoiler\n::::\nb', options()), '')
    }
  )

  await t.test(
    'should close w/ a closing fence followed by white space',
    async function () {
      assert.equal(micromark(':::spoiler\n::: \t\nc', options()), '<p>c</p>')
    }
  )

  await t.test(
    'should not close w/ a “closing” fence followed by other characters',
    async function () {
      assert.equal(micromark(':::spoiler\n::: b\nc', options()), '')
    }
  )

  await t.test('should close w/ an indented closing fence', async function () {
    assert.equal(micromark(':::spoiler\n  :::\nc', options()), '<p>c</p>')
  })

  await t.test(
    'should not close w/ when the “closing” fence is indented at a tab size',
    async function () {
      assert.equal(micromark(':::spoiler\n\t:::\nc', options()), '')
    }
  )

  await t.test(
    'should not close w/ when the “closing” fence is indented more than a tab size',
    async function () {
      assert.equal(micromark(':::spoiler\n     :::\nc', options()), '')
    }
  )

  await t.test('should support blank lines in content', async function () {
    assert.equal(micromark(':::spoiler\n\n  \n\ta', options()), '')
  })

  await t.test('should support an EOL EOF', async function () {
    assert.equal(micromark(':::spoiler\n\ta\n', options()), '')
  })

  await t.test('should support an indented spoiler', async function () {
    assert.equal(
      micromark('  :::spoiler\n  b\n  :::\nc', options()),
      '<p>c</p>'
    )
  })

  await t.test(
    'should still not close an indented spoiler when the “closing” fence is indented a tab size',
    async function () {
      assert.equal(micromark('  :::spoiler\n\t:::\nc', options()), '')
    }
  )

  await t.test(
    'should support a block quote after a container',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n>a', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support code (fenced) after a container',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n```js\na', options()),
        '<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) after a container',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n    a', options()),
        '<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test(
    'should support a definition after a container',
    async function () {
      assert.equal(micromark(':::spoiler\n:::\n[a]: b', options()), '')
    }
  )

  await t.test(
    'should support a heading (atx) after a container',
    async function () {
      assert.equal(micromark(':::spoiler\n:::\n# a', options()), '<h1>a</h1>')
    }
  )

  await t.test(
    'should support a heading (setext) after a container',
    async function () {
      assert.equal(micromark(':::spoiler\n:::\na\n=', options()), '<h1>a</h1>')
    }
  )

  await t.test('should support html after a container', async function () {
    assert.equal(micromark(':::spoiler\n:::\n<!-->', options()), '<!-->')
  })

  await t.test('should support a list after a container', async function () {
    assert.equal(
      micromark(':::spoiler\n:::\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>'
    )
  })

  await t.test(
    'should support a paragraph after a container',
    async function () {
      assert.equal(micromark(':::spoiler\n:::\na', options()), '<p>a</p>')
    }
  )

  await t.test(
    'should support a thematic break after a container',
    async function () {
      assert.equal(micromark(':::spoiler\n:::\n***', options()), '<hr />')
    }
  )

  await t.test(
    'should support a block quote before a container',
    async function () {
      assert.equal(
        micromark('>a\n:::spoiler\nb', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>\n'
      )
    }
  )

  await t.test(
    'should support code (fenced) before a container',
    async function () {
      assert.equal(
        micromark('```js\na\n```\n:::spoiler\nb', options()),
        '<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) before a container',
    async function () {
      assert.equal(
        micromark('    a\n:::spoiler\nb', options()),
        '<pre><code>a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support a definition before a container',
    async function () {
      assert.equal(micromark('[a]: b\n:::spoiler\nb', options()), '')
    }
  )

  await t.test(
    'should support a heading (atx) before a container',
    async function () {
      assert.equal(micromark('# a\n:::spoiler\nb', options()), '<h1>a</h1>\n')
    }
  )

  await t.test(
    'should support a heading (setext) before a container',
    async function () {
      assert.equal(micromark('a\n=\n:::spoiler\nb', options()), '<h1>a</h1>\n')
    }
  )

  await t.test('should support html before a container', async function () {
    assert.equal(micromark('<!-->\n:::spoiler\nb', options()), '<!-->\n')
  })

  await t.test('should support a list before a container', async function () {
    assert.equal(
      micromark('* a\n:::spoiler\nb', options()),
      '<ul>\n<li>a</li>\n</ul>\n'
    )
  })

  await t.test(
    'should support a paragraph before a container',
    async function () {
      assert.equal(micromark('a\n:::spoiler\nb', options()), '<p>a</p>\n')
    }
  )

  await t.test(
    'should support a thematic break before a container',
    async function () {
      assert.equal(micromark('***\n:::spoiler\nb', options()), '<hr />\n')
    }
  )

  await t.test('should support prefixed containers (1)', async function () {
    assert.equal(
      micromark(' :::spoiler\n ', options({'*': h})),
      '<spoiler></spoiler>'
    )
  })

  await t.test('should support prefixed containers (2)', async function () {
    assert.equal(
      micromark(' :::spoiler\n - a', options({'*': h})),
      '<spoiler>\n<ul>\n<li>a</li>\n</ul>\n</spoiler>'
    )
  })

  await t.test('should support prefixed containers (3)', async function () {
    assert.equal(
      micromark(' :::spoiler\n - a\n > b', options({'*': h})),
      '<spoiler>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</spoiler>'
    )
  })

  await t.test('should support prefixed containers (4)', async function () {
    assert.equal(
      micromark(' :::spoiler\n - a\n > b\n :::', options({'*': h})),
      '<spoiler>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</spoiler>'
    )
  })

  await t.test('should not support lazyness (1)', async function () {
    assert.equal(
      micromark('> :::spoiler\nb', options({'*': h})),
      '<blockquote><spoiler></spoiler>\n</blockquote>\n<p>b</p>'
    )
  })

  await t.test('should not support lazyness (2)', async function () {
    assert.equal(
      micromark('> :::spoiler\n> b\nc', options({'*': h})),
      '<blockquote><spoiler>\n<p>b</p>\n</spoiler>\n</blockquote>\n<p>c</p>'
    )
  })

  await t.test('should not support lazyness (3)', async function () {
    assert.equal(
      micromark('> a\n:::spoiler', options({'*': h})),
      '<blockquote>\n<p>a</p>\n</blockquote>\n<spoiler></spoiler>'
    )
  })

  await t.test('should not support lazyness (4)', async function () {
    assert.equal(
      micromark('> :::spoiler\n:::', options({'*': h})),
      '<blockquote><spoiler></spoiler>\n</blockquote>\n<p>:::</p>'
    )
  })
})

test('content', async function (t) {
  await t.test('should support spoilers in spoilers', async function () {
    assert.equal(
      micromark(
        '::::spoiler{.big}\n:::spoiler{.small}\nText',
        options({'*': h})
      ),
      '<spoiler class="big">\n<spoiler class="small">\n<p>Text</p>\n</spoiler>\n</spoiler>'
    )
  })

  await t.test('should support lists in spoilers', async function () {
    assert.equal(
      micromark(':::spoiler\n* a\n:::', options({'*': h})),
      '<spoiler>\n<ul>\n<li>a</li>\n</ul>\n</spoiler>'
    )
  })

  await t.test(
    'should support lists w/ label brackets in spoilers',
    async function () {
      assert.equal(
        micromark(':::spoiler[]\n* a\n:::', options({'*': h})),
        '<spoiler>\n<ul>\n<li>a</li>\n</ul>\n</spoiler>'
      )
    }
  )

  await t.test(
    'should support lists w/ attribute braces in spoilers',
    async function () {
      assert.equal(
        micromark(':::spoiler{}\n* a\n:::', options({'*': h})),
        '<spoiler>\n<ul>\n<li>a</li>\n</ul>\n</spoiler>'
      )
    }
  )

  await t.test(
    'should support lazy containers in an unclosed spoiler',
    async function () {
      assert.equal(micromark(':::spoiler\n- +\na', options()), '')
    }
  )
})

/**
 * @this {CompileContext}
 *   Context.
 * @type {Handle}
 *   Handle.
 * @returns {undefined}
 *   Nothing.
 */
function h(d) {
  const content = d.content || d.label
  const attrs = d.attributes || {}
  /** @type {Array<string>} */
  const list = []
  /** @type {string} */
  let prop

  for (prop in attrs) {
    if (own.call(attrs, prop)) {
      list.push(this.encode(prop) + '="' + this.encode(attrs[prop]) + '"')
    }
  }

  this.tag('<' + d.name)
  if (list.length > 0) this.tag(' ' + list.join(' '))
  this.tag('>')

  if (content) {
    this.lineEndingIfNeeded()
    this.raw(content)
    this.lineEndingIfNeeded()
  }

  if (!htmlVoidElements.includes(d.name)) this.tag('</' + d.name + '>')
}

/**
 * @param {HtmlOptions | null | undefined} [options={}]
 *   HTML configuration (default: `{}`).
 */
function options(options) {
  return {
    allowDangerousHtml: true,
    extensions: [spoiler()],
    htmlExtensions: [spoilerHtml(options)]
  }
}
