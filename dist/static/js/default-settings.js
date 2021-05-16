"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultConfig = void 0;

require("source-map-support/register");

let DefaultConfig = {
  version: "0.0.1",
  projects: [],
  audio: {
    player: "mplayer"
  },
  domain: {
    description: "Website name",
    url: "http://www.yourdomain.com"
  },
  epub: {
    dirs: {
      content: "dist",
      output: "dist/downloads"
    },
    caching: {
      exclude: [],
      removeObsolete: {
        active: true,
        exclude: []
      },
      sign: false
    }
  },
  env: {
    node_path: []
  },
  excludeList: {
    contains: true,
    exactMatch: true,
    startsWith: true,
    endsWith: true
  },
  formats: {
    date: "DD-MM-YYYY",
    datetime: "DD-MM-YYYY HH:mm",
    time: "HH:mm",
    decimalSeparator: ",",
    thousandsSeparator: ".",
    mysql: {
      date: "%d-%m-%Y",
      datetime: "%d-%m-%Y %H:%i",
      time: "%H:%i"
    }
  },
  html: {
    dirs: {
      content: "content",
      includes: ["content/includes"],
      output: "dist",
      templates: ["templates"]
    },
    caching: {
      exclude: ["includes", "test-pages"],
      engine: "nunjucks",
      removeObsolete: {
        active: true,
        exclude: ["project-overview"]
      }
    },
    stripper: {
      active: false
    }
  },
  javascript: {
    apps: [],
    ast: false,
    browser: {
      removeImports: false,
      targets: ["defaults"]
    },
    bundles: [],
    compiler: "javascript",
    dirs: {
      output: "dist/static/js",
      source: "src"
    },
    lineStripping: {
      needsSpace: {
        after: ["else", "function", "var"],
        around: ["in", "new"]
      }
    },
    nodeVersion: "current",
    removeObsolete: {
      active: true,
      exclude: []
    },
    sourceMapping: true,
    sourceVersion: "es2017",
    useWatch: true
  },
  logging: {
    exitOnError: true,
    level: "debug",
    playSoundOn: {
      error: false,
      warning: true
    },
    transports: {
      console: {
        active: true,
        format: "HH:mm:ss"
      },
      file: {
        active: true,
        dir: "/tmp/cookware-headless-ice",
        format: "DD-MM-YYYY HH:mm:ss"
      },
      udf: {
        active: false
      }
    }
  },
  newProject: {
    dirStructure: {
      dirs: ["backups", "notes", "sass", "templates"],
      content: {
        dirs: ["includes"]
      },
      dist: {
        static: {
          dirs: ["css", "img"],
          js: {
            dirs: ["browser", "local", "test"],
            server: {
              dirs: ["controllers", "views"]
            }
          }
        }
      },
      src: {
        dirs: ["browser", "local", "test"],
        server: {
          dirs: ["controllers", "views"]
        }
      }
    }
  },
  pdf: {
    dirs: {
      content: "dist",
      output: "dist/downloads"
    },
    rendering: {
      exclude: ["downloads"],
      firstUpdateWeb: true,
      marginLeft: 10,
      marginRight: 10,
      removeObsolete: {
        active: true,
        exclude: []
      },
      sign: false
    }
  },
  projectOverview: {
    content: true,
    configuration: true,
    code: true,
    dir: "project-overviews",
    showPackages: false,
    styling: true,
    templates: true,
    documentation: true,
    goodies: true,
    exclude: ["api"]
  },
  sass: {
    colors: {
      sass: "_colors.scss",
      src: "dev/local-tools/js/colors-defined.js",
      projects: {
        Cookware: [{
          comment: "Cookware headless ice"
        }, {
          hex: "f5f5f5",
          name: "whitesmoke"
        }, {
          hex: "333",
          name: "grey-020"
        }, {
          hex: "808080",
          name: "grey-050"
        }, {
          hex: "909090",
          name: "grey-056"
        }, {
          hex: "08c",
          name: "blue-040"
        }, {
          comment: "Background color for the code element",
          hex: "eef",
          name: "bg-code"
        }]
      }
    },
    dirs: {
      source: "sass",
      output: "dist/static/css"
    },
    looks: [],
    removeObsolete: {
      active: true,
      exclude: []
    }
  },
  server: {
    backupInterval: 0,
    beautify: ["sass", "src"],
    firstUpdateSources: true,
    logStatic: false,
    port: 8000,
    staticUrl: "static",
    watchTimeout: 100
  },
  sitemap: {
    generate: true,
    exclude: []
  },
  stripping: {
    auto: true,
    suffix: "stripped"
  },
  tags: {
    active: false,
    generator: "universal",
    ignore: [],
    style: "all",
    styles: {
      allExuberant: ["C", "F", "M", "P", "V", "E", "I", "G", "A", "O", "S", "T"],
      allUniversal: ["C", "E", "G", "I", "M", "O", "P", "S", "T", "V", "c", "f", "g", "m", "p", "v"],
      all: ["C", "E", "G", "I", "M", "O", "P", "S", "T", "V", "c", "f", "g", "m", "p", "v"],
      simple: ["c", "C", "F", "m", "M", "O"]
    }
  },
  dependencies: {
    browserify: {
      external: []
    },
    express: {
      activate: {
        sessions: false,
        uploads: false
      },
      session: {
        cookie: {
          domain: "localhost",
          httpOnly: true,
          maxAge: 86400000,
          path: "/",
          sameSite: true
        },
        name: "cookware-headless-ice",
        resave: false,
        rolling: true,
        saveUninitialized: true,
        secret: "someSecretPhrase"
      },
      memoryStore: {
        type: "memoryStore",
        memoryStore: {
          checkPeriod: 86400000
        }
      }
    },
    gitDiff: {
      config: {
        color: false,
        flags: null,
        forceFake: true,
        noHeaders: false,
        save: false,
        wordDiff: false
      }
    },
    htmlcs: {
      config: {
        "asset-type": true,
        "attr-lowercase": true,
        "attr-no-duplication": true,
        "attr-value-double-quotes": true,
        "bool-attribute-value": true,
        "button-name": true,
        "button-type": true,
        charset: true,
        "css-in-head": true,
        doctype: "",
        "html-lang": true,
        "id-class-ad-disabled": true,
        "ie-edge": false,
        "img-alt": true,
        "img-src": true,
        "img-title": true,
        "img-width-height": true,
        "indent-char": "tab",
        "lowercase-class-with-hyphen": true,
        "lowercase-id-with-hyphen": true,
        "multiple-stylesheets": true,
        nest: true,
        "new-line-for-blocks": false,
        "no-space-before-tag-end": false,
        "protocol-omitted-in-href": false,
        "rel-stylesheet": true,
        "script-content": true,
        "script-in-tail": true,
        "self-close": "no-close",
        "spec-char-escape": true,
        "style-content": true,
        "style-disabled": true,
        "tag-pair": true,
        "tagname-lowercase": true,
        "title-required": true,
        "unique-id": true,
        "unnecessary-whitespace-in-text": true,
        "no-duplication-id-and-name": true,
        viewport: true,
        "label-for-input": true,
        "no-meta-css": {
          threshold: 3,
          minlen: 3
        },
        "no-hook-class": {
          keys: ["/[-_#](?:js|hook)[-_#]/"]
        },
        "no-bom": true,
        "max-len": 500,
        "max-error": 0,
        format: {},
        linters: {},
        default: true
      }
    },
    jsdoc: {
      config: {
        tags: {
          allowUnknownTags: true,
          dictionaries: ["jsdoc"]
        },
        source: {
          include: ["src", "package.json", "README.md"],
          includePattern: ".js$"
        },
        plugins: ["plugins/markdown"],
        templates: {
          cleverLinks: false,
          monospaceLinks: true,
          useLongnameInNav: false,
          showInheritedInNav: true
        },
        opts: {
          destination: "api/",
          encoding: "utf8",
          private: true,
          recurse: true,
          template: "./node_modules/minami"
        }
      }
    },
    nodeSass: {
      config: {
        includePaths: ["sass"],
        indentedSyntax: true,
        indentType: "tabs",
        indentWidth: 1,
        outputStyle: "nested"
      }
    },
    nunjucks: {
      config: {
        throwOnUndefined: false
      }
    },
    prettier: {
      config: {
        arrayExpand: true,
        bracketSpacing: true,
        printWidth: 80,
        semi: true,
        singleQuote: false,
        useTabs: true,
        tabWidth: 1
      }
    },
    typedoc: {
      output: "api",
      config: {
        module: "commonjs",
        excludeExternals: true,
        excludePrivate: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        ignoreCompilerErrors: true,
        includeDeclarations: true,
        logger: "none",
        name: "cookware-headless-ice API documentation",
        readme: "none",
        sourceMap: true,
        sourceRoot: "./src",
        target: "es5"
      }
    }
  }
};
exports.DefaultConfig = DefaultConfig;
//# sourceMappingURL=default-settings.js.map