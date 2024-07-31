module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: ['react-refresh', 'react', 'unused-imports', 'simple-import-sort', 'html', 'prettier'],
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
        trailingComma: 'es5',
        endOfLine: 'auto',
        // printWidth: 80,
        // plugins: ['prettier-plugin-tailwindcss'],
      },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'no-unused-vars': 'off',
    'react/prop-types': 'warn',
    'react/no-unescaped-entities': 'warn',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // 'max-len': [
    //   'error',
    //   {
    //     code: 80,
    //     ignoreComments: true,
    //     ignoreStrings: true,
    //     ignoreTemplateLiterals: true,
    //     ignoreRegExpLiterals: true,
    //     ignoreUrls: true,
    //   },
    // ],
  },
}
