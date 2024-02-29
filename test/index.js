/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-extension-directive').HtmlOptions} HtmlOptions
 * @typedef {import('micromark-extension-directive').Handle} Handle
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {micromark} from 'micromark'
import {htmlVoidElements} from 'html-void-elements'
import {directive, directiveHtml} from 'micromark-extension-directive'

const own = {}.hasOwnProperty

test('micromark-extension-directive (core)', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('micromark-extension-directive')).sort(),
      ['directive', 'directiveHtml']
    )
  })
})

test('micromark-extension-directive (syntax, container)', async function (t) {
  await t.test('should support a directive', async function () {
    assert.equal(micromark(':::b', options()), '')
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
      assert.equal(micromark(':::a', options()), '')
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

  await t.test('should support a digit in a name', async function () {
    assert.equal(micromark(':::a9', options()), '')
  })

  await t.test('should support a dash in a name', async function () {
    assert.equal(micromark(':::a-b', options()), '')
  })

  await t.test(
    'should not support a name followed by an unclosed `[`',
    async function () {
      assert.equal(micromark(':::a[', options()), '<p>:::a[</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{`',
    async function () {
      assert.equal(micromark(':::a{', options()), '<p>:::a{</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `[` w/ content',
    async function () {
      assert.equal(micromark(':::a[b', options()), '<p>:::a[b</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{` w/ content',
    async function () {
      assert.equal(micromark(':::a{b', options()), '<p>:::a{b</p>')
    }
  )

  await t.test('should support an empty label', async function () {
    assert.equal(micromark(':::a[]', options()), '')
  })

  await t.test('should support a whitespace only label', async function () {
    assert.equal(micromark(':::a[ \t]', options()), '')
  })

  await t.test('should not support an eol in an label', async function () {
    assert.equal(micromark(':::a[\n]', options()), '<p>:::a[\n]</p>')
  })

  await t.test('should support content in an label', async function () {
    assert.equal(micromark(':::a[a b c]', options()), '')
  })

  await t.test('should support markdown in an label', async function () {
    assert.equal(micromark(':::a[a *b* c]', options()), '')
  })

  await t.test('should not support content after a label', async function () {
    assert.equal(micromark(':::a[]asd', options()), '<p>:::a[]asd</p>')
  })

  await t.test('should support empty attributes', async function () {
    assert.equal(micromark(':::a{}', options()), '')
  })

  await t.test('should support whitespace only attributes', async function () {
    assert.equal(micromark(':::a{ \t}', options()), '')
  })

  await t.test('should not support an eol in attributes', async function () {
    assert.equal(micromark(':::a{\n}', options()), '<p>:::a{\n}</p>')
  })

  await t.test('should support attributes', async function () {
    assert.equal(micromark(':::a{a b c}', options()), '')
  })

  await t.test(
    'should not support EOLs around initializers',
    async function () {
      assert.equal(
        micromark(':::a{f  =\rg}', options()),
        '<p>:::a{f  =\rg}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF in a quoted attribute value',
    async function () {
      assert.equal(micromark(':::a{b="c', options()), '<p>:::a{b=&quot;c</p>')
    }
  )

  await t.test(
    'should not support EOLs in quoted attribute values',
    async function () {
      assert.equal(
        micromark(':::a{b="\nc\r  d"}', options()),
        '<p>:::a{b=&quot;\nc\rd&quot;}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF after a quoted attribute value',
    async function () {
      assert.equal(
        micromark(':::a{b="c"', options()),
        '<p>:::a{b=&quot;c&quot;</p>'
      )
    }
  )

  await t.test('should support whitespace after directives', async function () {
    assert.equal(micromark(':::a{b=c} \t ', options()), '')
  })

  await t.test('should support no closing fence', async function () {
    assert.equal(micromark(':::a\n', options()), '')
  })

  await t.test('should support an immediate closing fence', async function () {
    assert.equal(micromark(':::a\n:::', options()), '')
  })

  await t.test(
    'should support content after a closing fence',
    async function () {
      assert.equal(micromark(':::a\n:::\nb', options()), '<p>b</p>')
    }
  )

  await t.test(
    'should not close w/ a “closing” fence of two colons',
    async function () {
      assert.equal(micromark(':::a\n::\nb', options()), '')
    }
  )

  await t.test(
    'should close w/ a closing fence of more colons',
    async function () {
      assert.equal(micromark(':::a\n::::\nb', options()), '<p>b</p>')
    }
  )

  await t.test('should support more opening colons', async function () {
    assert.equal(micromark('::::a\n::::\nb', options()), '<p>b</p>')
  })

  await t.test(
    'should not close w/ a “closing” fence of less colons than the opening',
    async function () {
      assert.equal(micromark(':::::a\n::::\nb', options()), '')
    }
  )

  await t.test(
    'should close w/ a closing fence followed by white space',
    async function () {
      assert.equal(micromark(':::a\n::: \t\nc', options()), '<p>c</p>')
    }
  )

  await t.test(
    'should not close w/ a “closing” fence followed by other characters',
    async function () {
      assert.equal(micromark(':::a\n::: b\nc', options()), '')
    }
  )

  await t.test('should close w/ an indented closing fence', async function () {
    assert.equal(micromark(':::a\n  :::\nc', options()), '<p>c</p>')
  })

  await t.test(
    'should not close w/ when the “closing” fence is indented at a tab size',
    async function () {
      assert.equal(micromark(':::a\n\t:::\nc', options()), '')
    }
  )

  await t.test(
    'should not close w/ when the “closing” fence is indented more than a tab size',
    async function () {
      assert.equal(micromark(':::a\n     :::\nc', options()), '')
    }
  )

  await t.test('should support blank lines in content', async function () {
    assert.equal(micromark(':::a\n\n  \n\ta', options()), '')
  })

  await t.test('should support an EOL EOF', async function () {
    assert.equal(micromark(':::a\n\ta\n', options()), '')
  })

  await t.test('should support an indented directive', async function () {
    assert.equal(micromark('  :::a\n  b\n  :::\nc', options()), '<p>c</p>')
  })

  await t.test(
    'should still not close an indented directive when the “closing” fence is indented a tab size',
    async function () {
      assert.equal(micromark('  :::a\n\t:::\nc', options()), '')
    }
  )

  await t.test(
    'should support a block quote after a container',
    async function () {
      assert.equal(
        micromark(':::a\n:::\n>a', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support code (fenced) after a container',
    async function () {
      assert.equal(
        micromark(':::a\n:::\n```js\na', options()),
        '<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) after a container',
    async function () {
      assert.equal(
        micromark(':::a\n:::\n    a', options()),
        '<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test(
    'should support a definition after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\n[a]: b', options()), '')
    }
  )

  await t.test(
    'should support a heading (atx) after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\n# a', options()), '<h1>a</h1>')
    }
  )

  await t.test(
    'should support a heading (setext) after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\na\n=', options()), '<h1>a</h1>')
    }
  )

  await t.test('should support html after a container', async function () {
    assert.equal(micromark(':::a\n:::\n<!-->', options()), '<!-->')
  })

  await t.test('should support a list after a container', async function () {
    assert.equal(
      micromark(':::a\n:::\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>'
    )
  })

  await t.test(
    'should support a paragraph after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\na', options()), '<p>a</p>')
    }
  )

  await t.test(
    'should support a thematic break after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\n***', options()), '<hr />')
    }
  )

  await t.test(
    'should support a block quote before a container',
    async function () {
      assert.equal(
        micromark('>a\n:::a\nb', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>\n'
      )
    }
  )

  await t.test(
    'should support code (fenced) before a container',
    async function () {
      assert.equal(
        micromark('```js\na\n```\n:::a\nb', options()),
        '<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) before a container',
    async function () {
      assert.equal(
        micromark('    a\n:::a\nb', options()),
        '<pre><code>a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support a definition before a container',
    async function () {
      assert.equal(micromark('[a]: b\n:::a\nb', options()), '')
    }
  )

  await t.test(
    'should support a heading (atx) before a container',
    async function () {
      assert.equal(micromark('# a\n:::a\nb', options()), '<h1>a</h1>\n')
    }
  )

  await t.test(
    'should support a heading (setext) before a container',
    async function () {
      assert.equal(micromark('a\n=\n:::a\nb', options()), '<h1>a</h1>\n')
    }
  )

  await t.test('should support html before a container', async function () {
    assert.equal(micromark('<!-->\n:::a\nb', options()), '<!-->\n')
  })

  await t.test('should support a list before a container', async function () {
    assert.equal(
      micromark('* a\n:::a\nb', options()),
      '<ul>\n<li>a</li>\n</ul>\n'
    )
  })

  await t.test(
    'should support a paragraph before a container',
    async function () {
      assert.equal(micromark('a\n:::a\nb', options()), '<p>a</p>\n')
    }
  )

  await t.test(
    'should support a thematic break before a container',
    async function () {
      assert.equal(micromark('***\n:::a\nb', options()), '<hr />\n')
    }
  )

  await t.test('should support prefixed containers (1)', async function () {
    assert.equal(micromark(' :::x\n ', options({'*': h})), '<x></x>')
  })

  await t.test('should support prefixed containers (2)', async function () {
    assert.equal(
      micromark(' :::x\n - a', options({'*': h})),
      '<x>\n<ul>\n<li>a</li>\n</ul>\n</x>'
    )
  })

  await t.test('should support prefixed containers (3)', async function () {
    assert.equal(
      micromark(' :::x\n - a\n > b', options({'*': h})),
      '<x>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</x>'
    )
  })

  await t.test('should support prefixed containers (4)', async function () {
    assert.equal(
      micromark(' :::x\n - a\n > b\n :::', options({'*': h})),
      '<x>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</x>'
    )
  })

  await t.test('should not support lazyness (1)', async function () {
    assert.equal(
      micromark('> :::a\nb', options({'*': h})),
      '<blockquote><a></a>\n</blockquote>\n<p>b</p>'
    )
  })

  await t.test('should not support lazyness (2)', async function () {
    assert.equal(
      micromark('> :::a\n> b\nc', options({'*': h})),
      '<blockquote><a>\n<p>b</p>\n</a>\n</blockquote>\n<p>c</p>'
    )
  })

  await t.test('should not support lazyness (3)', async function () {
    assert.equal(
      micromark('> a\n:::b', options({'*': h})),
      '<blockquote>\n<p>a</p>\n</blockquote>\n<b></b>'
    )
  })

  await t.test('should not support lazyness (4)', async function () {
    assert.equal(
      micromark('> :::a\n:::', options({'*': h})),
      '<blockquote><a></a>\n</blockquote>\n<p>:::</p>'
    )
  })
})

test('micromark-extension-directive (compile)', async function (t) {
  await t.test('should support directives (youtube)', async function () {
    assert.equal(
      micromark(
        [
          ':::youtube\nw\n:::',
          ':::youtube[Cat in a box e]\nx\n:::',
          ':::youtube{v=5}\ny\n:::',
          ':::youtube[Cat in a box f]{v=6}\nz\n:::'
        ].join('\n\n'),
        options({youtube})
      ),
      [
        '<iframe src="https://www.youtube.com/embed/5" allowfullscreen>',
        '<p>y</p>',
        '</iframe>',
        '<iframe src="https://www.youtube.com/embed/6" allowfullscreen title="Cat in a box f">',
        '<p>z</p>',
        '</iframe>'
      ].join('\n')
    )
  })
})

test('content', async function (t) {
  await t.test(
    'should support container directives in container directives',
    async function () {
      assert.equal(
        micromark('::::div{.big}\n:::div{.small}\nText', options({'*': h})),
        '<div class="big">\n<div class="small">\n<p>Text</p>\n</div>\n</div>'
      )
    }
  )

  await t.test(
    'should support lists in container directives',
    async function () {
      assert.equal(
        micromark(':::section\n* a\n:::', options({'*': h})),
        '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>'
      )
    }
  )

  await t.test(
    'should support lists w/ label brackets in container directives',
    async function () {
      assert.equal(
        micromark(':::section[]\n* a\n:::', options({'*': h})),
        '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>'
      )
    }
  )

  await t.test(
    'should support lists w/ attribute braces in container directives',
    async function () {
      assert.equal(
        micromark(':::section{}\n* a\n:::', options({'*': h})),
        '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>'
      )
    }
  )

  await t.test(
    'should support lazy containers in an unclosed container directive',
    async function () {
      assert.equal(micromark(':::i\n- +\na', options()), '')
    }
  )
})

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function youtube(d) {
  const attrs = d.attributes || {}
  const v = attrs.v
  /** @type {string} */
  let prop

  if (!v) return false

  const list = [
    'src="https://www.youtube.com/embed/' + this.encode(v) + '"',
    'allowfullscreen'
  ]

  if (d.label) {
    list.push('title="' + this.encode(d.label) + '"')
  }

  for (prop in attrs) {
    if (prop !== 'v') {
      list.push(this.encode(prop) + '="' + this.encode(attrs[prop]) + '"')
    }
  }

  this.tag('<iframe ' + list.join(' ') + '>')

  if (d.content) {
    this.lineEndingIfNeeded()
    this.raw(d.content)
    this.lineEndingIfNeeded()
  }

  this.tag('</iframe>')
}

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
    if (d.type === 'containerDirective') this.lineEndingIfNeeded()
    this.raw(content)
    if (d.type === 'containerDirective') this.lineEndingIfNeeded()
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
    extensions: [directive()],
    htmlExtensions: [directiveHtml(options)]
  }
}
