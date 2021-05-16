# Compacting files

Back to [main  page](../README.md).

Compacting files is known as [file compression](https://en.wikipedia.org/wiki/File_compressing), [minifying](https://en.wikipedia.org/wiki/Minification_(programming)) aka minification.


## Philosophical point of view

Files, like dossiers, should not even exist or otherwise be as compact as possible. Should not include what is not really, really, really necessary.

Files that you keep to yourself (in this case, not leaving a computer) should remain readable. However, distribution towards web browsers requires not 'overdosing' disk traffic and network traffic while only software (browsers) needs enough readability for interpretation and rendering.


## Stripping

Stripping is the first step in compacting files. For which the file [stripping.ts](../src/lib/stripping.ts) is 'responsible'. In most cases. This mostly involves:
+ Merging all lines of code into 1 line
+ Stripping hierarchy (code indenting)
+ Removing spaces as in space needed to think about what's next.

Don't give software, a web browser, any (line, space or word) break that you should want to prevent for reasons of interpretation that should not break or be hindered.
Don't send truly obsolete or even misleading information.

Put differently: Do not err yourself 😉


## Sass

Cookware-headless-ice uses [node-sass](https://www.npmjs.com/package/node-sass) to not only compile 'nested' CSS output, but also to compile 'compressed' output.

Example: If you change a file like 'styles.scss', then the files 'styles.css' and 'styles-stripped.css' will be written to your HD.


## HTML

If you set your project settings, html > stripper > active to true (see [configuration](./configuration.md)), generated HTML will be stripped using [stripping.ts](../src/lib/stripping.ts).


## JavaScript or TypeScript

If you look at JavaScript in your project settings (see [configuration](./configuration.md)), the 'browser' and 'bundles' section include options to activate stripping.

The *workflow* I use is as follows:
+ For browsers, removal of imports can be activated in your projects settings. To prepare for composing a bundle. Coded in [javascript.ts](../src/local/javascript.ts).
+ [Babel](https://babeljs.io/docs/en/) transcompiles JavaScript or TypeScript files, controlled by [babel.ts](../src/local/babel.ts).
+ In case of a transcompiled file for browsers, also a stripped file will be written. Example: If you change a file like 'example.js', then the files 'example.js' and 'example-stripped.js' will be written to your HD. Coded in [stripping.ts](../src/lib/stripping.ts).
+ In case a transcompiled file is included in a browser bundle, the whole bundle will be created or rewritten. Which means reading transcompiled files, put them all into one file like 'bundle.js'.
+ For such composed bundles, also a stripped version will be written. For example, if the file 'bundle.js' is created or rewritten, also 'bundle-stripped.js' will be written to your HD. Coded in [stripping.ts](../src/lib/stripping.ts).

A browser bundle generated like this does not need to resolve internal references, since all imports (and by that, also requires) are stripped. Thus reducing the size of such a browser bundle.

### Tip

In a pure JavaScript project, I always include the following JavaScript function in the context to be rendered using the template engine [nunjucks](https://www.npmjs.com/package/nunjucks):

```
getStatic(path, forceStripped = false) {
   let dir = "/" + cfg.options.domain.appDir + "/static/";
   return process.env.NODE_ENV == "production" || forceStripped
      ? dir + FileUtils.getSuffixedFile(path, cfg.options.stripping.suffix)
      : dir + path;
}
```

In the base HTML template, this function is called like this for related CSS and JavaScript files:

```
<script defer src="{{ getStatic("browser/bundle.js") }}"></script>
```

In that way, during development, a nicely structured file will be sent to the browser. However, during production use only a compacted, stripped version. As long as software, a web browser, can interpret this file, that should be enough.


## Further revelations

Of course this attempt to 'enlighten' you is not complete yet. Culture and philosophy 'strongly' encourage to preserve certain mysteries. I don't. However, to further explore the principle of compacting, this project needs some more attention as in adding a next feature.

A next update of cookware-headless-ice will feature an added feature and some more revelations here that you might appreciate 😀