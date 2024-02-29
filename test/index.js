/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {micromark} from 'micromark'
import {spoiler, spoilerHtml} from 'micromark-extension-lemmy-spoiler'

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
    assert.equal(micromark(':::spoiler', options()), '<details></details>')
  })

  await t.test('should support a spoiler with space', async function () {
    assert.equal(micromark('::: spoiler', options()), '<details></details>')
  })

  await t.test('should support a spoiler with many spaces', async function () {
    assert.equal(micromark(':::    spoiler', options()), '<details></details>')
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
      assert.equal(micromark(':::spoiler', options()), '<details></details>')
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

  await t.test('should support whitespace after spoilers', async function () {
    assert.equal(micromark(':::spoiler \t ', options()), '<details></details>')
  })

  await t.test('should support no closing fence', async function () {
    assert.equal(micromark(':::spoiler\n', options()), '<details></details>')
  })

  await t.test('should support an immediate closing fence', async function () {
    assert.equal(micromark(':::spoiler\n:::', options()), '<details></details>')
  })

  await t.test(
    'should support content after a closing fence',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\nb', options()),
        '<details></details>\n<p>b</p>'
      )
    }
  )

  await t.test(
    'should not close w/ a “closing” fence of two colons',
    async function () {
      assert.equal(
        micromark(':::spoiler\n::\nb', options()),
        '<details>\n<p>::\nb</p>\n</details>'
      )
    }
  )

  await t.test(
    'should close w/ a closing fence of more colons',
    async function () {
      assert.equal(
        micromark(':::spoiler\n::::\nb', options()),
        '<details></details>\n<p>b</p>'
      )
    }
  )

  await t.test('should support more opening colons', async function () {
    assert.equal(
      micromark('::::spoiler\n::::\nb', options()),
      '<details></details>\n<p>b</p>'
    )
  })

  await t.test(
    'should not close w/ a “closing” fence of less colons than the opening',
    async function () {
      assert.equal(
        micromark(':::::spoiler\n::::\nb', options()),
        '<details>\n<p>::::\nb</p>\n</details>'
      )
    }
  )

  await t.test(
    'should close w/ a closing fence followed by white space',
    async function () {
      assert.equal(
        micromark(':::spoiler\n::: \t\nc', options()),
        '<details></details>\n<p>c</p>'
      )
    }
  )

  await t.test(
    'should not close w/ a “closing” fence followed by other characters',
    async function () {
      assert.equal(
        micromark(':::spoiler\n::: b\nc', options()),
        '<details>\n<p>::: b\nc</p>\n</details>'
      )
    }
  )

  await t.test('should close w/ an indented closing fence', async function () {
    assert.equal(
      micromark(':::spoiler\n  :::\nc', options()),
      '<details></details>\n<p>c</p>'
    )
  })

  await t.test(
    'should not close w/ when the “closing” fence is indented at a tab size',
    async function () {
      assert.equal(
        micromark(':::spoiler\n\t:::\nc', options()),
        '<details>\n<pre><code>:::\n</code></pre>\n<p>c</p>\n</details>'
      )
    }
  )

  await t.test(
    'should not close w/ when the “closing” fence is indented more than a tab size',
    async function () {
      assert.equal(
        micromark(':::spoiler\n     :::\nc', options()),
        '<details>\n<pre><code> :::\n</code></pre>\n<p>c</p>\n</details>'
      )
    }
  )

  await t.test('should support blank lines in content', async function () {
    assert.equal(
      micromark(':::spoiler\n\n  \n\ta', options()),
      '<details>\n<pre><code>a\n</code></pre>\n</details>'
    )
  })

  await t.test('should support an EOL EOF', async function () {
    assert.equal(
      micromark(':::spoiler\n\ta\n', options()),
      '<details>\n<pre><code>a\n</code></pre>\n</details>'
    )
  })

  await t.test('should support an indented spoiler', async function () {
    assert.equal(
      micromark('  :::spoiler\n  b\n  :::\nc', options()),
      '<details>\n<p>b</p>\n</details>\n<p>c</p>'
    )
  })

  await t.test(
    'should still not close an indented spoiler when the “closing” fence is indented a tab size',
    async function () {
      assert.equal(
        micromark('  :::spoiler\n\t:::\nc', options()),
        '<details>\n<p>:::\nc</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support a block quote after a container',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n>a', options()),
        '<details></details>\n<blockquote>\n<p>a</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support code (fenced) after a spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n```js\na', options()),
        '<details></details>\n<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) after a spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n    a', options()),
        '<details></details>\n<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test(
    'should support a definition after a spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n[a]: b', options()),
        '<details></details>\n'
      )
    }
  )

  await t.test(
    'should support a heading (atx) after a spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n# a', options()),
        '<details></details>\n<h1>a</h1>'
      )
    }
  )

  await t.test(
    'should support a heading (setext) after a spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\na\n=', options()),
        '<details></details>\n<h1>a</h1>'
      )
    }
  )

  await t.test('should support html after a spoiler', async function () {
    assert.equal(
      micromark(':::spoiler\n:::\n<!-->', options()),
      '<details></details>\n<!-->'
    )
  })

  await t.test('should support a list after a spoiler', async function () {
    assert.equal(
      micromark(':::spoiler\n:::\n* a', options()),
      '<details></details>\n<ul>\n<li>a</li>\n</ul>'
    )
  })

  await t.test('should support a paragraph after a spoiler', async function () {
    assert.equal(
      micromark(':::spoiler\n:::\na', options()),
      '<details></details>\n<p>a</p>'
    )
  })

  await t.test(
    'should support a thematic break after a spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n:::\n***', options()),
        '<details></details>\n<hr />'
      )
    }
  )

  await t.test(
    'should support a block quote before a spoiler',
    async function () {
      assert.equal(
        micromark('>a\n:::spoiler\nb', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support code (fenced) before a spoiler',
    async function () {
      assert.equal(
        micromark('```js\na\n```\n:::spoiler\nb', options()),
        '<pre><code class="language-js">a\n</code></pre>\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support code (indented) before a spoiler',
    async function () {
      assert.equal(
        micromark('    a\n:::spoiler\nb', options()),
        '<pre><code>a\n</code></pre>\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support a definition before a spoiler',
    async function () {
      assert.equal(
        micromark('[a]: b\n:::spoiler\nb', options()),
        '<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support a heading (atx) before a spoiler',
    async function () {
      assert.equal(
        micromark('# a\n:::spoiler\nb', options()),
        '<h1>a</h1>\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support a heading (setext) before a spoiler',
    async function () {
      assert.equal(
        micromark('a\n=\n:::spoiler\nb', options()),
        '<h1>a</h1>\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test('should support html before a spoiler', async function () {
    assert.equal(
      micromark('<!-->\n:::spoiler\nb', options()),
      '<!-->\n<details>\n<p>b</p>\n</details>'
    )
  })

  await t.test('should support a list before a spoiler', async function () {
    assert.equal(
      micromark('* a\n:::spoiler\nb', options()),
      '<ul>\n<li>a</li>\n</ul>\n<details>\n<p>b</p>\n</details>'
    )
  })

  await t.test(
    'should support a paragraph before a spoiler',
    async function () {
      assert.equal(
        micromark('a\n:::spoiler\nb', options()),
        '<p>a</p>\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test(
    'should support a thematic break before a spoiler',
    async function () {
      assert.equal(
        micromark('***\n:::spoiler\nb', options()),
        '<hr />\n<details>\n<p>b</p>\n</details>'
      )
    }
  )

  await t.test('should support prefixed containers (1)', async function () {
    assert.equal(micromark(' :::spoiler\n ', options()), '<details></details>')
  })

  await t.test('should support prefixed containers (2)', async function () {
    assert.equal(
      micromark(' :::spoiler\n - a', options()),
      '<details>\n<ul>\n<li>a</li>\n</ul>\n</details>'
    )
  })

  await t.test('should support prefixed containers (3)', async function () {
    assert.equal(
      micromark(' :::spoiler\n - a\n > b', options()),
      '<details>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</details>'
    )
  })

  await t.test('should support prefixed containers (4)', async function () {
    assert.equal(
      micromark(' :::spoiler\n - a\n > b\n :::', options()),
      '<details>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</details>'
    )
  })

  await t.test('should not support lazyness (1)', async function () {
    assert.equal(
      micromark('> :::spoiler\nb', options()),
      '<blockquote><details></details>\n</blockquote>\n<p>b</p>'
    )
  })

  await t.test('should not support lazyness (2)', async function () {
    assert.equal(
      micromark('> :::spoiler\n> b\nc', options()),
      '<blockquote><details>\n<p>b</p>\n</details>\n</blockquote>\n<p>c</p>'
    )
  })

  await t.test('should not support lazyness (3)', async function () {
    assert.equal(
      micromark('> a\n:::spoiler', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>\n<details></details>'
    )
  })

  await t.test('should not support lazyness (4)', async function () {
    assert.equal(
      micromark('> :::spoiler\n:::', options()),
      '<blockquote><details></details>\n</blockquote>\n<p>:::</p>'
    )
  })
})

test('content', async function (t) {
  await t.test('should support spoilers in spoilers', async function () {
    assert.equal(
      micromark('::::spoiler\n:::spoiler\nText', options()),
      '<details>\n<details>\n<p>Text</p>\n</details>\n</details>'
    )
  })

  await t.test('should support lists in spoilers', async function () {
    assert.equal(
      micromark(':::spoiler\n* a\n:::', options()),
      '<details>\n<ul>\n<li>a</li>\n</ul>\n</details>'
    )
  })

  await t.test(
    'should support lazy containers in an unclosed spoiler',
    async function () {
      assert.equal(
        micromark(':::spoiler\n- +\na', options()),
        '<details>\n<ul>\n<li>\n<ul>\n<li></li>\n</ul>\n</li>\n</ul>\n<p>a</p>\n</details>'
      )
    }
  )
})

function options() {
  return {
    allowDangerousHtml: true,
    extensions: [spoiler()],
    htmlExtensions: [spoilerHtml()]
  }
}
