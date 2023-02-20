module.exports = {
    arrowParens: 'always',
    tabWidth: 4,
    printWidth: 100,
    semi: false,
    trailingComma: 'all',
    singleQuote: true,
    // pnpm doesn't support plugin autoloading
    // https://github.com/tailwindlabs/prettier-plugin-tailwindcss#installation
    plugins: [require('prettier-plugin-tailwindcss')],
    tailwindConfig: './tailwind.config.js',
}
