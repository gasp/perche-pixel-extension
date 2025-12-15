/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ['prettier-plugin-tailwindcss'],
  singleQuote: true,
  semi: false,
  arrowParens: 'avoid',
  trailingComma: 'all',
  printWidth: 80,
}
