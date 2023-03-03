const BEMPattern = /^.[a-z]?([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}$/
const kebabCasePattern = /^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/

module.exports = {
  plugins: ['stylelint-scss', 'stylelint-prettier'],
  customSyntax: 'postcss-scss',
  ignoreFiles: [
    './node_modules',
    './source/sass/_dev/**/*.scss',
    './source/**/node_modules/**/*.scss',
  ],
  rules: {
    'prettier/prettier': true,
    'color-hex-case': 'lower',
    'declaration-no-important': true,
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',
    'function-whitespace-after': 'always',
    'max-nesting-depth': [4, { ignore: ['pseudo-classes'] }],
    'no-empty-source': null,
    'no-descending-specificity': null,
    'selector-class-pattern': BEMPattern,
    'keyframes-name-pattern': kebabCasePattern,
    'block-opening-brace-newline-after': 'always-multi-line',
    'block-opening-brace-space-after': 'always-single-line',
    'block-opening-brace-space-before': 'always',
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: [
          'after-comment',
          'blockless-after-blockless',
          'blockless-after-same-name-blockless',
        ],
        ignoreAtRules: ['else'],
      },
    ],
    'at-rule-no-unknown': null,
    'at-rule-no-vendor-prefix': true,
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'property-no-vendor-prefix': true,
    'scss/at-rule-no-unknown': true,
    'scss/dollar-variable-first-in-block': [true, { ignore: ['comments', 'imports'] }],
    'scss/dollar-variable-colon-space-after': 'always',
    'scss/dollar-variable-pattern': kebabCasePattern,
    'scss/at-if-closing-brace-newline-after': 'always-last-in-chain',
  },
}
