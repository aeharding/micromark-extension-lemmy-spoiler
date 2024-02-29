# micromark-extension-lemmy-spoiler

## What is this?

This package contains an extension that add support for lemmy spoiler syntax in
markdown to micromark.

## Install

This package is \[ESM only]\[esm].
In Node.js (version 16+), install with \[npm]\[]:

\[npm]\[]:

```sh
npm install micromark-extension-lemmy-spoiler
```

In Deno with \[`esm.sh`]\[esmsh]:

```js
import {spoiler, spoilerHtml} from 'https://esm.sh/micromark-extension-lemmy-spoiler@1'
```

In browsers with \[`esm.sh`]\[esmsh]:

```html
<script type="module">
  import {spoiler, spoilerHtml} from 'https://esm.sh/micromark-extension-lemmy-spoiler@1?bundle'
</script>
```

## Use

Say our document `example.md` contains:

```markdown
A lovely language know as :abbr[HTML]{title="HyperText Markup Language"}.
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {micromark} from 'micromark'
import {spoiler, spoilerHtml} from 'micromark-extension-lemmy-spoiler'

const output = micromark(await fs.readFile('example.md'), {
  extensions: [spoiler()],
  htmlExtensions: [spoilerHtml()]
})

console.log(output)
```

…now running `node example.js` yields:

```html
<p>A lovely language know as <abbr title="HyperText Markup Language">HTML</abbr>.</p>
```
