exports = module.exports = {
  presets: [
    'next/babel',
    '@zeit/next-typescript/babel'
  ],
  plugins: [
    [
      'styled-components',
      {
        ssr: true,
        preprocess: false,
        displayName: true
      }
    ]
  ]
}
